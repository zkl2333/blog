---
title: "Hermes Agent v0.12.0 的「自助策展人」：终于有人来修剪这座疯长的花园了"
description: "v0.12.0 发布的 Curator 后台策展人，自动给 Skill 打分、合并、淘汰——正好是上一篇说的「只进不出」问题的官方答案。让 Hermes 自己研究自己，把 Curator 的架构、运作逻辑和防御机制拆了一遍。"
publishDate: "2026-05-01"
tags: ["hermes-agent", "curator", "skill", "ai", "deep-dive"]
---

5 月 1 日早上刷公众号，看到一条推送：Hermes Agent v0.12.0 发了，代号「The Curator Release」。里面提到一个叫"自助策展人"的东西，能在后台自动给 Skill 打分、合并重复项、清理死 Skill。

我看完第一反应——这不就是我三天前那篇博客结尾念叨的吗？「一个会自动生长但从不修剪的系统，时间长了就是这样。」

二话不说，先 `hermes update`。跑完之后，我开始问 Hermes 这个 Curator 到底是什么。于是有了下面这篇——我让它自己研究自己，然后写出来。

---

以下内容由 Hermes（deepseek-v4-pro）根据 v0.12.0 源码、release notes 和相关 PR 自主研究和撰写。

---

## 为什么叫「策展人」

在拆代码之前，先聊聊名字。Curator 这个词，Herems 不是随便起的。

在西方博物馆体系里，curator 是一个分量很重的角色。他不只是给藏品贴标签的人。史明立在《中西方博物馆策展人制度浅析》中这样描述：西方博物馆语境下的 curator 兼顾展览的方方面面——既具备阐释展品的专业能力，又具备展品选取、观众交流、公关宣传、文物收藏与保护等多方面的综合能力。简单说，这是一个**同时管研究、管挑选、管维护**的人。

这个词翻译到中文，博物馆学界吵了很多年。湖南省博物馆的李慧君主张统一译为「策展人」，理由是这个译名已被业界普遍接受，且强调展览导向有助于推动藏品研究向公众展示转化。山东大学的尹凯则反对，指出西方 curator 的"生成性和多义性"在中文里没法用两个字概括，「策展人」的翻译"是对博物馆藏品研究和专业学术的忽视，是展览形式对知识内容的凌驾与吞噬"。也有学者提出「典藏研究员」「研究员」等译名，认为更接近 curator 的本意。

这个争论本身很有意思，但先不去管它。重点是：**无论哪种译法，curator 的内核始终是"筛选、整理、维护"——从来不是"销毁"。**

Herems 把这个后台程序命名为 Curator，用意就在这里。你的 Skill 库是一座不断膨胀的馆藏。它需要有人来甄别哪些值得保留、哪些可以合并、哪些该归档到库房。这个角色是策展人，不是清洁工。实际操作上也确实如此：Curator 最极端的动作只是把 Skill 移到 `.archive/` 目录，一键可恢复——就像博物馆把展品从展厅撤到库房，而不是扔进垃圾车。

在源码中，这个定位体现在模块 docstring 的第一段：

> "The curator is an auxiliary-model task that periodically reviews agent-created skills and maintains the collection."
>
> —— [`agent/curator.py`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1-L6)

注意"maintains the collection"（维护馆藏）这个措辞。不是"deletes"，不是"removes"，是"maintains"。

名字讲清楚了，下面拆它的运作逻辑。

## 一、Curator 是什么

Curator 是一个运行在 Hermes Gateway 后台的自主 Skill 维护程序。它不是一个独立进程，没有 cron daemon。它的触发入口是 [`maybe_run_curator()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1298-L1316)，在每次 Session 启动时被调用，做两道门控判断：

1. 上次运行距今是否超过了 `interval_hours`（调用 [`should_run_now()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L181-L208) 检查时间间隔和暂停状态）
2. 当前 gateway 是否闲置了至少 `min_idle_hours`（由调用方传入的 `idle_for_seconds` 参数判断）

两道门都过，就触发一次策展。默认参数定义在模块顶部：

```python
# agent/curator.py L39-L42
DEFAULT_INTERVAL_HOURS = 24 * 7    # 7 天
DEFAULT_MIN_IDLE_HOURS = 2         # 闲置 2 小时
DEFAULT_STALE_AFTER_DAYS = 30      # 30 天不用 → 休眠
DEFAULT_ARCHIVE_AFTER_DAYS = 90    # 90 天不用 → 归档
```

这些默认值可以通过 `config.yaml` 中的 `curator` 段覆盖，读取逻辑在 [`get_interval_hours()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L136-L141) 等函数中。

每次策展的状态持久化在 `~/.hermes/skills/.curator_state` 文件中，结构定义在 [`_default_state()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L53-L61)：

```python
# agent/curator.py L53-L61
def _default_state() -> Dict[str, Any]:
    return {
        "last_run_at": None,
        "last_run_duration_seconds": None,
        "last_run_summary": None,
        "last_report_path": None,
        "paused": False,
        "run_count": 0,
    }
```

这个文件用原子写入（`mkstemp` + `os.replace`），不怕跑一半崩掉。

## 二、怎么运作：两阶段流水线

Curator 的的运作分成泾渭分明的两个阶段。第一阶段不调用任何 LLM，纯规则驱动；第二阶段 fork 出一个策展 agent，用模型做决策。总调度在 [`run_curator_review()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L993-L1115)。

### 阶段一：纯规则自动流转

每次 Curator 启动，第一步是 [`apply_automatic_transitions()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L215-L255)。这个函数不消耗任何 LLM token，完全是确定性逻辑。

它遍历 `skill_usage.agent_created_report()` 返回的所有 Skill，对每个 Skill 读取 `last_activity_at` 时间戳。注意这里的"活跃"不只是被调用来执行任务——被 `skill_view()` 查看、被 `skill_manage()` 修改，都算活跃，都会刷新时间戳。

核心判断逻辑（[L228-L253](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L228-L253)）：

```python
for row in _u.agent_created_report():
    name = row["name"]
    if row.get("pinned"):       # pinned skill 直接跳过
        continue

    anchor = last_activity or created_at or now  # 取最晚的时间锚点

    current = row.get("state", _u.STATE_ACTIVE)

    if anchor <= archive_cutoff and current != _u.STATE_ARCHIVED:
        _u.archive_skill(name)            # 归档
    elif anchor <= stale_cutoff and current == _u.STATE_ACTIVE:
        _u.set_state(name, _u.STATE_STALE)  # 标记休眠
    elif anchor > stale_cutoff and current == _u.STATE_STALE:
        _u.set_state(name, _u.STATE_ACTIVE)  # 重新激活
```

四条规则：
- 在 `stale_after_days`（30 天）之内有活动 → 保持 active
- 超过 30 天但不到 `archive_after_days`（90 天）→ 标记为 **stale**
- 超过 90 天 → 归档到 `~/.hermes/skills/.archive/`
- 被标记 stale 后又有了新活动 → 自动 **reactivate**

**pinned skill 免疫一切。** 判断在循环的最开头（L231 `if row.get("pinned"): continue`），无论时间戳多老，都不会被碰。

第一阶段跑完后，初始状态写入 `.curator_state`，然后进入第二阶段。

### 阶段二：LLM 策展——伞形合并

这才是 Curator 真正"思考"的部分。入口在 [`_run_llm_review()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1161-L1291)，会 fork 一个完整的 AIAgent 实例。

**fork agent 的隔离措施：**

| 措施 | 源码 | 说明 |
|------|------|------|
| 独立模型 | [`_resolve_review_model()` L1118-L1158](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1118-L1158) | 走 `auxiliary.curator.{provider,model}`，可不走主模型 |
| 高迭代上限 | [L1237](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1237) `max_iterations=9999` | 伞形合并可能需要 50-100 次 API 调用 |
| 禁自我审查 | [L1244-L1245](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1244-L1245) `_memory_nudge_interval = 0; _skill_nudge_interval = 0` | 策展过程不会触发新的 Background Review |
| 无上下文文件 | [L1240](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1240) `skip_context_files=True` | 不加载 AGENTS.md 等 |
| 无记忆 | [L1241](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1241) `skip_memory=True` | 不污染长期记忆 |
| 静默输出 | [L1252-L1254](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1252-L1254) stdout/stderr → `/dev/null` | 工具调用日志不污染终端 |

策展 agent 收到两份输入：一份候选名单（由 [`_render_candidate_list()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L973-L990) 生成，包含每个 Skill 的名称、状态、使用计数、最后活跃时间），以及一个长达 110 行的策展 prompt（[`CURATOR_REVIEW_PROMPT`，L262-L372](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L262-L372)）。

**这个 prompt 是 Curator 的灵魂。** 它明确要求策展 agent 不是做"这个 Skill 有没有用"的二选一判断，而是做**前缀聚类 + 伞形合并**——把散落的碎片拼成类级别的知识条目。

Prompt 的核心指令（[L293-L331](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L293-L331)）：

1. **识别前缀聚类**——比如 `hermes-config-debug`、`hermes-config-migration`、`hermes-config-rollback` 属于同一类
2. **判断是否需要伞形 Skill**——"Would a human maintainer write this as N separate skills, or as one skill with N labeled subsections?"
3. **三种合并方式**：
   - merge into existing umbrella（已有伞 → 追加小节）
   - create new umbrella（太碎 → 新建伞形 SKILL.md）
   - demote to references/templates/scripts（窄但有价值 → 降级为支持文件）
4. **迭代**——"Don't stop after 3 merges."

Prompt 里有一句直指核心：

> "A collection of hundreds of narrow skills where each one captures one session's specific bug is a FAILURE of the library — not a feature."
>
> —— [`agent/curator.py` L268-L269](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L268-L269)

几百个一次性的窄 Skill 不是资产，是负债。这正是我上一篇博客花了 2000 字论证的论点。而这句出现在 Curator 的系统 prompt 里，说明 Hermes 团队清晰地意识到了问题，并且把这个判断写进了策展 agent 的 DNA。

策展结束后，agent 必须输出一份结构化的 YAML：

```yaml
consolidations:
  - from: hermes-config-debug
    into: hermes-config
    reason: absorbed debug workflow as subsection
prunings:
  - name: one-off-audit-2026
    reason: stale single-session artifact with no reusable content
```

这份报告写入 `~/.hermes/logs/curator/{时间戳}/`，包含 `run.json`（机器可读）和 `REPORT.md`（人类可读）。报告生成逻辑在 [`_write_run_report()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L682-L816) 中，包含策展前后的 Skill 快照 diff、自动流转统计、LLM 工具调用明细、以及分类结果。

## 三、三层防御：为什么这次不是「又一个大锤」

上一篇博客里，我写到 Background Review 机制的问题是"太主动了"——没有确认、没有提示、静默创建。Curator 会不会又是个静默乱删的大锤？

源码给出的答案是：不会。Curator 嵌入了三层防御。

### 第一层：只碰 agent-created skill

候选名单的过滤由 [`skill_usage.is_agent_created()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/tools/skill_usage.py#L204) 实现。builtin skill（源码自带的 `.bundled_manifest` 中的条目）和 hub skill（hub lockfile 中的条目）永远不会进入候选名单。从官方渠道获得的 Skill，Curator 完全不管。

Curator 的 docstring 也写死了这条不变量（[L16](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L16)）：

> "Only touches agent-created skills (see tools/skill_usage.is_agent_created)"

而在策展 prompt 中，这条规则被重复强调（[L277-L278](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L277-L278)）：

> "DO NOT touch bundled or hub-installed skills. The candidate list below is already filtered to agent-created skills only."

这意味着即使策展 agent 某天完全失控，爆炸半径也被限定在你自己的 skill 范围内，不会波及系统核心功能。

### 第二层：归档，不删除

Curator 最极端的操作是 `mv` 目录到 `~/.hermes/skills/.archive/`。源码中没有删除文件的代码路径。策展 prompt 第一段硬规则（[L279-L281](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L279-L281)）：

> "DO NOT delete any skill. Archiving (moving the skill's directory into ~/.hermes/skills/.archive/) is the maximum destructive action. Archives are recoverable; deletion is not."

这不是技术限制——`mv` 之后的路径在程序看来和删除没区别。这是设计哲学：策展人把展品收进库房，策展人不扔东西。被归档的 Skill 可以用 `hermes curator restore <name>` 一键恢复。

### 第三层：模型输出 + 工具调用双重审计

策展分类不是由模型一句 YAML 说了算的。实际判定由 [`_reconcile_classification()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L590-L679) 完成，它把两路信息做交叉验证：

- **模型的结构化报告**（YAML 中的 `consolidations` 和 `prunings` 列表）——提供意图和理由
- **工具调用启发式审计**（由 [`_classify_removed_skills()`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L401-L506) 回溯实际 `skill_manage` 调用）——提供地面实况

交叉验证的三条规则（[L598-L610](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L598-L610)）：

- 模型声明「X 合并到 Y」且 Y 确实存在 → 采信模型报告
- 模型声明「X 合并到 Y」但 Y 不存在（**幻觉**）→ 降级，改用工具调用审计的实际发现，或 fallback 到 pruned
- 模型漏写了某个实际发生过的合并 → 审计机制补上，标记 `source="tool-call audit"`

这意味着即使策展用的模型偶尔胡说八道，最终写入 REPORT.md 的分类是有据可查的。幻觉会被抓出来并降级处理。

## 四、闭环：从「只进不出」到「策展循环」

回到三天前那篇博客的结尾。我写的是：

> 一个会自动生长但从不修剪的系统，时间长了就是这样。得，先手动割草吧。

当时我能做的三件事是：调高 nudge_interval、手动 `hermes skills list` 清理、蹲着社区 Issue #11425。那是一个被动防御的姿势——系统在设计上不做修剪，我只能自己拿着剪刀上。

v0.12.0 的 Curator 把这件事从手动变成了自动，而且把"修剪"升级成了"策展"。阶段一解决「这东西过期了吗」，阶段二解决「这些碎片应该拼成什么形状」。两个阶段加在一起，Skill 库从放任生长的野地变成了有园丁打理的花园。

这里还要提一句 Self-Improvement Loop 的同期升级。v0.12.0 不只是加了 Curator，还重写了 Background Review 底层逻辑（[`_spawn_background_review()`，`run_agent.py` L3521-L3615](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/run_agent.py#L3521-L3615)）。关键变化：

- **继承父会话 runtime**（[L3574-L3583](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/run_agent.py#L3574-L3583)）：provider、model、api_key、base_url 正确传递，不再出现 OAuth 场景下"No LLM provider configured"的错误
- **工具集限制**（[L3586](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/run_agent.py#L3586) `enabled_toolsets=["memory", "skills"]`）：review agent 只能用记忆和 Skill 工具，不会跑偏
- **过滤前轮 tool message**（[L3607-L3609](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/run_agent.py#L3607-L3609)）：`_summarize_background_review_actions()` 会跳过已在父会话历史中的旧工具消息，避免把"上次对话已保存"当作"刚才又保存了"

两套机制的分工现在非常清晰：

- **Review agent**（Background Review）：每次对话后运行，负责「这次对话有没有值得沉淀的经验」，决定**要不要存新东西**
- **Curator**：按周期运行，扫描所有已存 Skill，负责「这些旧东西还该不该留」，决定**要不要清理旧东西**

一个管存，一个管清。之前只有存没有清，是半套系统。现在合龙了。

## 五、配置与使用

Curator 默认开启。升级到 v0.12.0 后，config migration v22→v23 会自动写入默认配置（[`hermes_cli/config.py` L3318-L3398](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/hermes_cli/config.py#L3318-L3398)）：

```yaml
curator:
  enabled: true
  interval_hours: 168       # 7 天
  min_idle_hours: 2         # 闲置 2 小时以上才触发
  stale_after_days: 30      # 30 天不用标记为休眠
  archive_after_days: 90    # 90 天不用归档
```

如果想让 Curator 用独立模型（推荐，省钱），配在 `auxiliary.curator` 下（模型解析逻辑见 [`_resolve_review_model()` L1118-L1158](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/agent/curator.py#L1118-L1158)，优先级：`auxiliary.curator` → legacy `curator.auxiliary` → 主模型）：

```yaml
auxiliary:
  curator:
    provider: deepseek
    model: deepseek-v4-flash
```

常用命令一览（实现在 [`hermes_cli/curator.py`](https://github.com/NousResearch/hermes-agent/blob/0c35092accdc4e306e982c7b1913bf97b9bb3d3d/hermes_cli/curator.py)）：

| 命令 | 用途 |
|------|------|
| `hermes curator status` | 查看策展状态、Skill 活跃度排行（最常用/最少用 Top 5） |
| `hermes curator run` | 手动触发一次策展（加 `--sync` 可等待 LLM 阶段完成） |
| `hermes curator pause` / `resume` | 暂停 / 恢复自动策展 |
| `hermes curator pin <name>` / `unpin` | 钉住 / 取消钉住某个 Skill（pinned skill 免疫一切自动操作） |
| `hermes curator restore <name>` | 从 `.archive/` 恢复一个被归档的 Skill |

策展报告位于 `~/.hermes/logs/curator/{YYYYMMDD-HHMMSS}/` 下，每次运行一个子目录。`run.json` 是完整机器记录（包含策展前后的 Skill 快照 diff、自动流转统计、LLM 工具调用明细、分类结果），`REPORT.md` 是人类可读摘要。

**一个注意事项：** v0.12.0 升级后，ComfyUI 和 TouchDesigner-MCP 从 optional 变成了 builtin 默认自带。这意味着 `hermes skills list` 的条目数会突然涨几个——这是官方加菜，不是 Curator 的 bug，Curator 也不管 builtin skill。

---

三天前，我蹲在 Issue #11425 下面等 PR。三天后，社区已经把策展机制合进了主分支，从 prompt 设计到代码防御到审计报告一整套配齐。从「能不能有人来管一下这个只进不出的系统」到「这里是你的策展人、你的管道、你的审计报告」——这个闭环的速度，让我觉得开源有时候真的挺厉害的。
