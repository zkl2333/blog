---
title: "解剖 Hermes Agent 的「自我进化」：后台 Skill 自动生成链路完全追踪"
description: "从昨晚发现一堆搞不清来源的 Skill 说起，顺藤摸瓜追踪 run_agent.py 源码、配置项、Fork 机制、Prompt 设计，再到社区几个积压 Issue 和 146 个 Skill 年烧 8000 万 Token 的成本账。一个会自动生长但从不会修剪的系统。"
publishDate: "2026-04-29"
tags: ["hermes-agent", "source-code", "skill", "ai", "deep-dive"]
---

## 先说说这篇博客是怎么来的，我为什么研究这个

**Q：一开始为什么会去看 Skill？**

A：4 月 28 日晚上，我在读一篇 Hermes 教程文章（agentupdate.ai / awesome-ai-books），本来是想研究多 Agent 的通信机制。结果发现文章里引用的 Skill 根本不存在，大概率是 AI 幻觉出来的例子。于是我开始好奇：我自己现在到底有多少 Skill？

**Q：当时我问的第一个问题是什么？**

A：我问 Hermes：“我们能区分哪些 Skill 是自己创建的吗，非官方的？”一开始我不太信任回答，就让 Hermes 查源码确认。最后确认 Hermes 的 Skill 来源大致分成三类：`builtin`、`hub`、`local`。

**Q：看完非官方 Skill 列表之后发生了什么？**

A：我让 Hermes 把非官方的列成表，然后第一反应就是：这么多，都是我用得上的吗？于是又问能不能先清理掉根本用不上的。清着清着就开始觉得不对劲：这些 Skill 到底是从哪来的？

**Q：这次为什么盯上了自动创建这件事？**

A：我之前就知道 Hermes 有对话后自动总结经验、生成 Skill 的机制，只是一直没太把这套机制当回事。这次是聊着聊着，亲眼看到又一个 Skill 在后台被创建了，而且没有确认提示。我当时的原话大概是：“刚刚又创建另外一个，也没见和我确认啊。”于是继续查 tools 调用记录，把这套 Background Review 机制完整串了起来：会话结束后，Hermes 会自动 fork 一个 review agent 去总结经验、更新 Memory 或 Skill。

**Q：亲眼看到 Hermes 自动创建 Skill 之后，我关掉了吗？**

A：没有。我其实觉得这套机制挺好用的，只是不想它太频繁、太主动。所以最后不是关掉，而是把频率降下来：`creation_nudge_interval` 从 10 调到 30，`nudge_interval` 也从 10 调到 30。

**Q：4 月 29 日凌晨继续深挖了什么？**

A：我顺着 Background Review 的源码链路继续追，重点看了 `run_agent.py` 里 review agent 的生成过程。接着又问了几个问题：创建 Skill 有没有调用计数？有没有遗忘机制？系统会不会把所有 Skill 描述都拼进 prompt？

**Q：源码给出的答案是什么？**

A：`insights.py` 里能查使用统计，但只是被动查账，不参与自动淘汰。官方文档和第三方文章也几乎只讲怎么创建、怎么使用，没讲怎么遗忘。`prompt_builder.py` 则确认了另一个更扎心的事实：每个 turn 都会把所有可用 Skill 的名称和截断描述注入 system prompt。

**Q：那时候我实际有多少 Skill？**

A：4 月 29 日凌晨那次 `hermes skills list` 查到的是 108 个。mlops 下面挂着 huggingface-hub、vllm、unsloth、axolotl……我一个写前端的，看到这些名字完全懵了，还是问了 AI 才知道大概是机器学习、模型训练、评估那类东西。继续往下翻，gaming 下面还有 pokemon-player 和 minecraft-modpack-server，creative 下面更离谱，16 个，从 pixel-art 到 songwriting-and-ai-music 一个不落。

**Q：最后这篇文章想解决什么？**

A：我想把这次追踪整理清楚：Hermes 为什么会自动生成 Skill，什么时候触发，后台 review agent 是怎么 fork 出来的，Prompt 为什么会鼓励后台 review agent 积极更新，以及为什么一个“只进不出”的 Skill 系统最后会变成 prompt 成本问题。下面就是我和 Hermes 翻源码后的成果，贴出来给也在用 Hermes 的人参考，顺便自己回头好找。

---

> 以下技术分析部分由 AI 根据上述对话背景协助撰写，源码引用和 Issue 链接已经核实。

## 通过计数器控制什么时候生成 Skill

Hermes 后台生成 Skill 靠两个计数器，[`run_agent.py` L1644-1646](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L1644) 初始化：

```python
self._memory_nudge_interval = 10
self._turns_since_memory = 0
self._iters_since_skill = 0
```

这两个计数器的计数粒度完全不是一回事：

| 项目     | Memory Nudge            | Skill Nudge                      |
| -------- | ----------------------- | -------------------------------- |
| 计数变量 | `_turns_since_memory`   | `_iters_since_skill`             |
| +1 时机  | 收到用户消息            | 执行一次工具调用                 |
| +1 源码  | [L10154][memory-turn]   | [L10432][skill-iter]             |
| 配置项   | `memory.nudge_interval` | `skills.creation_nudge_interval` |
| 配置源码 | -                       | [L1751-1754][skill-config]       |
| 默认阈值 | 10                      | 10                               |

[memory-turn]: https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L10154
[skill-iter]: https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L10432
[skill-config]: https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L1751

别小看这个差别，实际用起来差得远。只要任务稍微复杂一点——比如“帮我把这个项目部署到服务器上”——Hermes 可能连着调 12 个工具：读文件、跑命令、改配置……一轮对话下来 `_iters_since_skill` 直接加到 12，当场就能触发 Skill Review。Memory 那边按用户消息计数，真的来回聊上 10 轮才到阈值。

还有个细节：计数器跨 Turn 不清零。[L10104](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L10104) 注释写明 `NOT reset here`，累加到阈值才归零，或者 Session 恢复的时候重置（[L9133](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L9133)）。

两个计数器各自到了阈值后，会在 Turn 结尾汇合（[L13406-13427](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L13406)）。只要 Memory Review 或 Skill Review 任意一个条件成立，Hermes 就会调用 `_spawn_background_review()`。

## 后台起了个“阅卷老师”

[`_spawn_background_review()`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L3427) 做的事说白了就是：Hermes 先开一个子线程，再在线程里 new 一个全新的 `AIAgent`：

```python
review_agent = AIAgent(
    model=self.model,              # 跟父 Agent 同一个模型
    max_iterations=8,              # 最多跑 8 轮
    quiet_mode=True,
    enabled_toolsets=["memory", "skills"],
)
review_agent._memory_nudge_interval = 0   # 防递归，不然子 Agent 又 Fork 孙 Agent
review_agent._skill_nudge_interval = 0
```

这个后台 review agent 的 `approval` 回调被设成 `auto-deny`，碰到需要授权的操作会直接拒绝，不会弹窗打断当前会话。

随后，这个后台 review agent 会拿到主会话完整的历史快照，并把 Review Prompt 当作一条新的 user message 追加进去，再执行 `run_conversation()`。跑完以后，后台 review agent 把结果写回磁盘，主线程只打一行 `💾 Memory updated` 之类的提示。整个过程都在后台完成：前台对话还在继续，另一个线程已经开始“总结今天学到了什么”。

## Prompt 比我想象的激进多了

我本来以为这个后台 Review 会挺克制——好歹只是个“学习笔记”嘛。

然后我读了 [`_SKILL_REVIEW_PROMPT`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L3232)（L3232-3306），上来第一句就是：

> Be ACTIVE — most sessions produce at least one skill update, even if small. A pass that does nothing is a missed learning opportunity, not a neutral outcome.

翻译成人话：大多数会话都应该产出点啥，啥都不干等于浪费学习机会。

这段 Prompt 给后台 review agent 设了四级操作优先级，从“首选”到“没辙了才这么干”：

1. 更新本轮已经加载的 Skill——对话里 `skill_view` 用过的，优先改这个 Skill
2. 更新已有的 Umbrella Skill——靠 `skills_list` + `skill_view` 找范围匹配的，打补丁
3. 在现有 Umbrella 下加支持文件——`references/` 放知识库，`templates/` 放模板，`scripts/` 放脚本
4. 新建 Umbrella Skill——前面三条都不适用了才建，命名要求落在类别层面（不能叫 `fix-xxx-today` 这种一次性的）

注意第四条的措辞——“前面三条都不适用时才建”。但开头那句“大部分会话都应该产出点什么”已经把基调定死了：对后台 review agent 来说，不产出反而是不正常的。

关于删除，Prompt 倒是提了一嘴：发现重叠的 Skill 时“记下来”（"note it in your reply"）。后台 review agent 的 toolset 里确实有 `skill_manage(action='delete')`，但 Prompt 从头到尾没给出过删除指令。工具给了，嘴没张——等于把剪刀放在桌上，却没人说“该剪了”。

三段 Prompt（[`_MEMORY_REVIEW_PROMPT`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L3221)、`_SKILL_REVIEW_PROMPT`、[`_COMBINED_REVIEW_PROMPT`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/run_agent.py#L3308)）都是类级别的字符串常量，不在 `config.yaml` 里，也没有环境变量、没有钩子。想改 Prompt 内容？只能改源码。

配置里能动的只有触发频率：

```yaml
# ~/.hermes/config.yaml
memory:
  nudge_interval: 30 # 默认 10，设 0 关闭
skills:
  creation_nudge_interval: 30 # 默认 10，设 0 关闭
```

## 上百个 Skill，每次 API 调用都背着

刚才说的那些还算“机制问题”，真正让我肉疼的是下面这个。

[`build_skills_system_prompt()`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/agent/prompt_builder.py#L654) 在每次 API 调用前都会做这几件事：

1. 扫 `~/.hermes/skills/` 下所有 `SKILL.md`
2. 读 frontmatter 里的 `name`、`description`、`category`
3. description 超过 60 字就截断（[`skill_utils.py` L426](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/agent/skill_utils.py#L426)：`desc[:57] + "..."`）
4. 按 category 分组，拼成 `<available_skills>` XML 块，塞进 system prompt

这里有两层缓存（进程内 LRU + 磁盘 snapshot），但缓存只是加快读取速度，不解决根本问题：**Skill 数量没有上限**。Skill 多一个，每次调用的 system prompt 就胖一圈。

回到我自己的情况。4 月 29 日凌晨分析时，system prompt 里实际注入了 108 个 Skill。现在再看是 97 个：

| 时间点               | Skill 数量 | 备注                                 |
| -------------------- | ---------: | ------------------------------------ |
| 4 月 29 日凌晨分析时 |        108 | system prompt 实际注入数量           |
| 现在                 |         97 | 78 个 builtin，19 个 local，hub 为 0 |

也就是说，数量不是从 58 涨到 97，而是从 108 变成了 97，净少 11 个。这个减少大概率来自 Hermes 版本更新后部分 builtin Skill 被移除或合并，不是我主动修剪的结果。因为我真正手动卸载过的只有 `news-reader` 一个。

这才是尴尬的地方：我不一定知道这些 Skill 是什么，也不一定知道它们从哪来，但 Hermes 会忠实地把它们带进每一次请求。mlops 那些看起来像机器学习、模型训练、评估相关的 Skill，我平时几乎用不上，却还是跟着 system prompt 一起上车。

## 社区用户算了笔账

[Issue #13534](https://github.com/NousResearch/hermes-agent/issues/13534) 里有个用户跑了 146 个 Skill 的生产环境，并且认认真真算了一笔账：

| Skill 数 | 每轮多出 Token | 一年（50 轮/天） | V4 Flash 年费 |
| -------: | -------------: | ---------------: | ------------: |
|       58 |         ~1,500 |             ~27M |        ~$7.56 |
|      146 |         ~4,400 |             ~80M |       ~$22.40 |
|      300 |         ~9,000 |            ~164M |       ~$45.92 |

V4 Flash 便宜，看着还好。换 Pro 模型（$3.48/1M token）跑 146 个 Skill，一年就是 $278，而且这数字只增不减。

[Issue #11425](https://github.com/NousResearch/hermes-agent/issues/11425) 里还有个更直观的例子：另一个用户装了 89 个 Skill，Minecraft 服务器、Pokemon 模拟器、Stable Diffusion 全在，一个都没真正用过。每次 API 调用都在为这些“幽灵 Skill”的描述付钱。看到这里，我太懂了。

## 统计有，淘汰没影

Hermes 倒也不是完全不知道哪些 Skill 在用。`/insights`（[`agent/insights.py`](https://github.com/NousResearch/hermes-agent/blob/58a6171bfb0ba2ca10b1b08854511736cd77a623/agent/insights.py)）能查出使用情况：它会扫描 session 数据库里的 `tool_calls` 记录，聚合出 `view_count`、`manage_count`、`last_used_at`。

但 `/insights` 只是一个事后统计面板。它不是实时计数器，也不参与任何自动决策。看完数据以后，用户还得自己一条条 `skill_manage(action='delete')` 手动清。

自动清理？想得美。Review Prompt 没给删除指令，系统里也没有 TTL，更没有按使用频率淘汰的逻辑。唯一的删除路径还是手动操作。

## 我在 Issue 区看到的

翻了一圈相关 Issue，5 个全 Open，没人认领：

| Issue                 | 在聊啥                                       |
| --------------------- | -------------------------------------------- |
| [#11425][issue-11425] | Skill 生命周期：归档 + 重要性分级 + 自动清理 |
| [#13534][issue-13534] | 使用量追踪 + 冲突检测 + Token 成本量化       |
| [#10164][issue-10164] | System prompt 预算管控                       |
| [#429][issue-429]     | Skill 描述质量改进                           |
| [#15471][issue-15471] | Memory 淘汰机制                              |

[issue-11425]: https://github.com/NousResearch/hermes-agent/issues/11425
[issue-13534]: https://github.com/NousResearch/hermes-agent/issues/13534
[issue-10164]: https://github.com/NousResearch/hermes-agent/issues/10164
[issue-429]: https://github.com/NousResearch/hermes-agent/issues/429
[issue-15471]: https://github.com/NousResearch/hermes-agent/issues/15471

其中 #11425 画了最完整的饼：Phase 1 使用追踪 → Phase 2 重要性分级（critical / important / normal / low）→ Phase 3 归档状态 → Phase 4 可选自动归档。截至我写这段字，这条生命周期方案还没有对应的 PR。

## 我能做的

不改源码的话，我眼下能做的就这几招：

1. `creation_nudge_interval` 和 `nudge_interval` 都调到 30，实在烦了直接设 0 关掉
2. 隔三差五 `hermes skills list` 扫一遍，看不顺眼的直接删
3. 蹲着 [#11425](https://github.com/NousResearch/hermes-agent/issues/11425)，一旦合并立刻开归档

说真的，“对话后自动沉淀经验”这个思路本身没毛病。下次碰到类似问题，Hermes 直接调现成的 Skill，确实省事。但目前这套实现只进不出。现在这 97 个 Skill 里，真正常用的肯定只占一小部分；剩下那些我叫不上来、也搞不清来源的条目，全是每次 API 调用时白占 Token 的库存，跟冰箱里放了两年的冻肉似的。

一个会自动生长但从不修剪的系统，时间长了就是这样。得，先手动割草吧。
