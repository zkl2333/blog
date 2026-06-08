---
name: blog
description: Write personal blog posts for the user's Astro blog (git repo zkl2333/blog, deployed to blog.zkl2333.com). This skill ships inside the blog repo (project-level), so the project root IS the blog repo — no cross-machine path discovery needed. Use when the user wants to write a new post, document a project/exploration, or record a story they've been through. Drives a multi-turn editor-style workflow — interview the user first, plan an outline, draft, iterate on facts and voice, add images, commit. Strongly opposes the "AI just generates text from scratch" pattern. See references/interview.md for the question bank, references/voice.md for tone patterns, references/frontmatter.md for the schema.
---

# Blog

为用户的个人博客（Astro，部署到 `blog.zkl2333.com`，git 仓库 `zkl2333/blog`）写文章。

> **本 skill 随博客仓库分发（项目级 skill），所在仓库就是要写的博客仓库——项目根即博客根，无需再跨机器定位。**

## 何时触发

- 用户说"我想写篇博客记录这个 / 把这事写成博客 / 写一篇关于 X 的博客"
- 用户在做某个项目（折腾树莓派、写 skill、调试问题）后说"这个值得写一篇"
- 用户给了博客目录路径 + 上下文素材
- 用户提到"博客"+"采访我 / 我的想法 / 思路"

## 核心理念

**这是用户的个人博客，不是技术教程**。

> 用户的原话：「我不想教育谁但是我想让读者觉得我很酷」「自己回头看以前的博客也很酷」「写博客的人很酷」

所以：
- **不教育、不端着** — 不写"读者你应该知道..."，不解释每个术语
- **第一人称** — 是"我"不是"我们"，是"我做了"不是"实现了"
- **平实有自嘲** — 大白话，敢承认"代码我没逐行看"、"FreeType MONO 我到现在也说不清"
- **技术细节是 cool 的装饰** — 出场是为了让读者觉得"这人挺懂"，不是为了让读者学懂
- **老实交代 AI 参与度** — 这是博客的特色调子（"这篇博客也是 AI 写的"），不藏着掖着

详见 [references/voice.md](references/voice.md)。

## 🛑 硬规则：不许直接闷头写

**任何时候开始草稿前，必须先做完前两步**：

1. **收集背景**（代码、git 历史、上下文、上一篇博客的调性）
2. **采访用户**（一次问 1-3 个问题，多轮交互）

直接 `Write` 一个完整草稿 = 反模式。即便用户给了详细需求，也要先用 1-2 轮问题确认。

**原因**：博客的灵魂在用户自己的"起心动念"、"那一刻的体感"、"我跟 AI 怎么协作的"——这些不在代码里、不在 git log 里，**只在用户脑子里**。不问就只能编造。

例外：用户明确说"直接写吧，我没空采访" → 允许跳过采访，但开头要明确说明草稿基于哪些既有素材，请用户读完后告诉你哪里偏了。

## 工作流（必走）

### 1. 收集背景（agent 自己做）

- 读相关代码（如果博客主题是某个项目）
- 看 git history（commit 顺序、时间、消息 → 还原事件时间线）
- 读上一篇博客或同主题历史博客（建立调性参照）
- 看博客仓库的 `CLAUDE.md` / `AGENTS.md` / `site.config.ts`
- **深挖项目的运行记录 / 历史快照**（agent 会话日志、定时任务产物、配置文件的旧版本备份）——一手记录里常藏着连用户自己都不知道的真相。本 skill 实战靠 grep 配置的历史快照，挖出过「AI 在某次重构里把一个功能覆盖丢了、空转两月没人发现」，成了全文最硬的一笔，这种料采访绝对问不出来。

**输出**：一份简短的"我手上有的素材"清单给用户看，让他知道你已经搞清楚了什么、还缺什么。

### 2. 采访用户（核心步骤）

按 [references/interview.md](references/interview.md) 的问题库，**一次只问 1-3 个相关问题**。问题分组：

- **起心动念组** — 为什么开始？什么时候？睡前 / 工作空闲？
- **关键瞬间组** — peak moments / aha / frustration / 哪一刻最有体感
- **协作模式组** — 跟 AI 怎么分工的？人工拍板了什么？
- **反思组** — 现在回头看是不是绕了？最优解吗？
- **结尾意图组** — 想读者带走什么？（即便答案是"就想显得酷"）

**节奏**：每轮 1-3 个问题，等用户答完再追问。不要一次抛 5 个让用户疲劳。

**事实校对**：用户记忆经常错位（"我推到 Pi 上看到糊" 其实是预览页就糊了）。每收到一个事实声明，用 git 历史 / 代码状态校对，发现偏差立刻指出来。

### 3. 提交大纲

采访够了之后，**先给 outline，不直接写正文**。Outline 包含：

- 标题候选（2-3 个，按"酷度"排）
- 每段一两句话的概括（按叙事弧线）
- 估总字数（一般 1800-2500 字中文）
- 调子说明（直接引用用户原话最有力）

让用户砍 / 加 / 换调子。**Outline 通过了才动笔写正文**。

**叙事类文章，大纲里必须先把"精确因果链 / 时序"列出来给用户确认**——按对话 + git 重建"先发生什么、因为什么才有下一步"，别把同时发生 / 先后发生搞混，别把"中途被否的弯路"写成"起因"。本会话踩过：把先后两步的修复画成一张图（显得像一次搞定）、把后面才出现的弯路提前抛出来显得突兀。时序错位是用户最常打回的硬伤之一。

### 4. 写第一版

- 用 `Write` 工具创建 `src/content/post/<slug>/index.md`
  - slug：kebab-case，能直接看出主题（如 `eink-render-jsx`、`home-pi-revival`）
  - 用文件夹结构，方便配图共置
- frontmatter 必填字段见 [references/frontmatter.md](references/frontmatter.md)
- 写完跑 `pnpm exec astro check` 验证 schema

### 5. 改

用户会提具体反馈。常见类型：

- **事实错误** → 一处一处对照修
- **调子问题** → 整段重写，引用用户原话校准
- **冗余 / 太啰嗦** → 砍段落
- **太细节 / 太干** → 加段落

每次修改用 `Edit`，不要重写整个文件。

### 6. 配图

详见 [references/images.md](references/images.md)。简要：

- **本仓库已支持自动 fallback**：frontmatter 没设 `coverImage` 时，自动用正文第一张图当封面（本地 `./xxx.png` 走 Astro 优化，远程 `https://...` 用 `<img>`）
- **现成素材优先**：先盘点项目目录、`.github/images/`、之前博客的封面
- **没合适的就生成**：用项目代码本身渲染（如墨水屏 PNG 拼图）、用 Python PIL / Node 写个小脚本拼，**临时脚本生成完就删**

### 7. 验证

```bash
cd <blog-repo> && pnpm exec astro check
```

确认 0 errors。**不**需要 `pnpm build`，除非改了组件 / 数据层（不只是新文章）。

**含 mermaid / 图表的文章，astro check 不够**：本博客 `rehype-mermaid` 用 `pre-mermaid` 策略 = **客户端渲染**，语法错 / 渲染瞎 astro check 抓不到。必须起 dev 真渲一次（`.claude/launch.json` 里已有 `blog` 配置：`pnpm -C <blog 路径> exec astro dev --port 4321`，用 `preview_start` 起），导航到该文章，确认：① 每个 mermaid 块都渲成 `<svg>` 不是 raw 文本；② **在正文窄栏下字大可读**——窄栏一律 `flowchart TD`（竖排）不要 `LR`（横排会被压到看不清）；③ 配图都 200 正常加载。**`preview_screenshot` 若超时或视口为 0（headless 浏览器常见），别卡在截图——改用 `preview_eval` 读 `.mermaid svg` 的 `viewBox`（高>宽即竖排正常）和 `.nodeLabel` 文本，照样能确认渲成 svg、节点没渲乱、含特殊字符的标签没出错。** 方言（实测，跟"别加引号 / 括号 / subgraph"这类旧说法不符，以跑通的文章为准）：节点纯中文可裸写 `A[文本]`，含 `+ （） : / ·` 等特殊字符就用双引号包 `A["文本"]`；换行用 `<br/>`；`subgraph` 能用（eink 那篇就用了）；别用 `classDef`。不确定先照现有 mermaid 文章抄方言。

### 8. Commit

按博客仓库的 commit 风格（`feat: ...` 中文 conventional commit）。详见根目录的 commit skill 或 `AGENTS.md`。

**示例**：
```
feat: 新增 <topic> 探索博客

<1-2 句中文 body 说承接什么、解决了什么、附加了什么>
```

不 push（用户自己 push）。除非用户说"push 吧"。

### 9. Skill 自我进化（**必走，结束前最后一步**）

**博客 commit 完之后、在结束本轮对话前**，必须做一次反思：把这次写作过程里**学到的偏好 / 踩到的坑 / 暴露的工作流漏洞**映射成对 skill 文件本身的具体编辑提案。

**反思维度**（每条都自问）：

- **采访**：哪些问题用户秒答？哪些用户说"记不清 / 不纠结这个"？哪些被否决？
- **调子**：用户重复纠正过的措辞 / 风格？用户夸过"对就是这味儿"的段落？
- **事实校对**：用户的哪些记忆跟 git history 不一致？校对方式有没有更快的？
- **流程**：哪一步多余、卡顿、被跳过、用户主动加塞？
- **新场景**：这次出现了 skill 没覆盖的情况吗？

**输出格式**：每条提案精确到 `file path + 文本差异 + 一句话解释`，**不要泛泛的"可以更好"**。

**呈现给用户审 → 用户拍板 → agent 用 `Edit` 应用 → 改 `.claude/skills/blog/` 下的文件，单独成一个 commit**（与文章 commit 分开，但都进本博客仓库——skill 现在随仓库走）。

**没值得改就老实说**："这次没发现值得优化的点"。**不为了显得勤奋编造提案**——比错过真问题还糟。

详见 [references/self-evolution.md](references/self-evolution.md)。

## 反模式（不许做）

1. ❌ 一上来就 `Write` 一个完整草稿
2. ❌ 问一次抛 5+ 个问题
3. ❌ 替用户编造"那一刻我特别激动"之类的体感
4. ❌ 把博客写成"X 技术教程"，附"读者应该掌握..."
5. ❌ 假装 AI 没参与（"我和 Claude 调研后..."）—— 反过来要老实交代
6. ❌ 用"我们"代替"我"
7. ❌ 给术语加教学性括注（"FreeType MONO（一种字体渲染模式）"）—— 信任读者
8. ❌ 用拉满的修辞（"令人惊叹的"、"前所未有的"）—— 用户讨厌这种调
9. ❌ 凡涉及历史事实，不查 git 就编 —— 用户记忆经常错位
10. ❌ 不当 cover 加在 frontmatter，又同个图在正文重复出现
11. ❌ 引用上一篇博客时凭印象转述 — 必须用 Grep 拉原文核对。用户对引文敏感，会发现转述与原话的偏差
12. ❌ 一篇博客内堆积破折号（`——`）— 详见 [references/voice.md](references/voice.md) 破折号小节

## 博客仓库（项目级 skill，无需再定位）

**本 skill 已经随博客仓库分发——当前项目根就是博客仓库根**，文章写进 `src/content/post/`、配置看根目录的 `astro.config.ts` / `CLAUDE.md` / `AGENTS.md`，都用相对项目根的路径即可。

> 历史背景：这套 skill 早先放在全局 skills 仓库（`zkl2333/skills`），靠"运行时扫 git remote 命中 `zkl2333/blog`"来定位博客，并反复强调"绝不写死绝对路径"。迁成项目级后这层定位彻底没必要了——skill 就在仓库里，路径天然跟着仓库走。

## 仓库约定（zkl2333/blog 特有）

- **包管理**：`pnpm`
- **slug 风格**：kebab-case，文件路径 `src/content/post/<slug>/index.md`
- **frontmatter title 上限 60 字符**（schema 强制）
- **tags 全小写**（schema 强制 `toLowerCase`）
- **cross-link 后缀斜杠**：`/posts/<slug>/`、`/tags/<tag>/`（注意不是 `/posts/<slug>`）
- **Hermes tag 是 `hermes-agent`，不是 `hermes-curator`**（后者是某篇文章 slug，曾经踩过）
- **commit 风格**：Conventional Commits 中文，`feat:` / `fix:` / `docs:` 等
- **不 commit `dist/` 和 `.astro/`**

## 参考

- [references/interview.md](references/interview.md) — 采访问题库 + 节奏指南
- [references/voice.md](references/voice.md) — 文风对照表（真实例子）
- [references/frontmatter.md](references/frontmatter.md) — Astro content schema
- [references/images.md](references/images.md) — 封面图 + 内联图处理
- [references/self-evolution.md](references/self-evolution.md) — 自我进化机制（每次写完反思 → 提案改 skill）
