---
name: poster-article
description: 在本博客里写「特稿 / 复盘 / 海报风格」的沉浸式长文时使用，需要章节幕、大字引文、对比双栏、数据卡、编号步骤、多栏卡片等杂志级视觉组件。这些是博客自带的暖色 MDX 组件（@/components/poster），亮暗自适应。普通文章用 markdown + `> [!note]` callout 即可，无需本 skill。
---

# 博客特稿组件（MDX）

写**沉浸式特稿 / 深度复盘 / 海报风格长文**时，用这套 MDX 组件搭出杂志级排版（章节幕、大字引文、对比双栏、数据卡……）。配色全部跟随博客暖色主题、亮暗自适应。

**什么时候用**：内容偏「叙事 / 复盘 / 拆解」，希望读起来像一篇精心设计的长卷特稿。
**什么时候不用**：普通技术笔记、短文、日常记录——直接 markdown，框用 `> [!note]` callout 就够了，别套这套组件。

## 两条硬规则

1. **文章必须是 `.mdx`**（不是 `.md`），否则组件不会被解析。
2. 文件顶部（frontmatter 之后）**一行导入**所有用到的组件：
   ```mdx
   import { Lead, Act, Quote, Aside, Vs, Side, Stats, Stat, Steps, Step, Cards, Card } from "@/components/poster";
   ```

## MDX 内容书写规则（最容易踩的坑）

- 组件里放**多行 markdown**（`Side` / `Quote` / `Aside` / `Lead` 内部的段落或列表）时，内容要 **前后留空行 + 顶格**（不缩进），否则 markdown 不被解析：
  ```mdx
  <Side role="老板">

  - 要点一
  - 要点二

  </Side>
  ```
- 只放**单行纯文本**的组件（`Step` / `Card` / `Stat` 的内容）可以直接写、不用空行：
  ```mdx
  <Step title="标题">一句话描述。</Step>
  ```

## 组件速查

| 组件 | props | 用途 |
|---|---|---|
| `<Lead>…</Lead>` | — | 开篇导语 / 题记（居中、轻） |
| `<Act no sub>标题</Act>` | `no` 编号(如 "01")、`sub` 副标题 | 章节幕：mono 编号 + 大标题 + Bebas 数字水印 + 副标题 |
| `<Quote src>金句</Quote>` | `src` 来源 | 大字 pull quote |
| `<Aside title>…</Aside>` | `title` 标签(默认"侧记") | 侧记盒子，标签骑左上角 |
| `<Vs>…</Vs>` | — | 对比双栏容器，内放两个 `<Side>` |
| `<Side role tone>…</Side>` | `role` 角色名、`tone="win"\|"lose"` | 双栏的一栏；tone 出 ✓/✗ 与绿/红（用于得失对比） |
| `<Stats>…</Stats>` | — | 数据卡组容器，内放 `<Stat>` |
| `<Stat value label danger>` | `value` 大数字、`label` 说明、`danger` 红 | 单张数据卡（value 用 Bebas 大字）；适合**短**数字，长表达式放 label |
| `<Steps>…</Steps>` | — | 编号步骤容器（自动 01/02/03） |
| `<Step title>描述</Step>` | `title` 小标题 | 单个步骤 |
| `<Cards>…</Cards>` | — | 多栏卡片容器，内放 `<Card>` |
| `<Card title tone>描述</Card>` | `title` 标题、`tone="up"\|"down"` | 单张卡片；tone 给标题绿/红 |

## 完整示例（可直接照搬改写）

```mdx
---
title: "某产品复盘"
description: "一句话摘要。"
publishDate: "2026-06-08"
---

import { Lead, Act, Quote, Aside, Vs, Side, Stats, Stat, Steps, Step, Cards, Card } from "@/components/poster";

<Lead>

用一两句话把读者带入这篇长文的语境与基调。

</Lead>

<Act no="01" sub="副标题 · 一句话点题">第一章标题</Act>

正文段落照常用 markdown 写，**加粗**、`代码`、[链接](/) 都正常。

<Quote src="出处 · 章节">

被强调的金句，单独立起来。

</Quote>

<Aside title="侧记 · 小标题">

补充性的旁白、轶事，放在盒子里不打断主线。

</Aside>

<Act no="02" sub="两难">核心矛盾</Act>

<Vs>
<Side role="A 方 · 立场">

- 诉求一
- 诉求二

</Side>
<Side role="B 方 · 立场">

- 诉求一
- 诉求二

</Side>
</Vs>

<Stats>
<Stat value="300万" label="峰值 DAU" />
<Stat value="18%" label="次日留存" danger />
<Stat value="<10%" label="7 日留存" danger />
</Stats>

<Steps>
<Step title="第一步">一句话描述发生了什么。</Step>
<Step title="第二步">一句话描述。</Step>
</Steps>

<Cards>
<Card title="▲ 群体甲" tone="up">他们的诉求与结果。</Card>
<Card title="▼ 群体乙" tone="down">他们的诉求与结果。</Card>
</Cards>

<Act no="03" sub="收束">结论</Act>

<Vs>
<Side role="可取之处" tone="win">

- 做对的事一
- 做对的事二

</Side>
<Side role="系统性问题" tone="lose">

- 没做好的事一
- 没做好的事二

</Side>
</Vs>

<Quote src="结语">

最后一句有分量的话，收尾。

</Quote>
```

## 提示

- 章节编号 `no` 用**数字**（"01"、"02"）比罗马数字好看（Bebas 字体下罗马 "I" 会变成一根竖线）。
- `Stat` 的 `value` 用单个短数字（`300万` / `18%` / `<10%`），别塞 `45%→18%` 这种长表达式（大字卡放不下会换行），把过程写进 `label`。
- 这些组件渲染后会随滚动渐入（已内置），无需额外处理。
- 想看真实示范：`src/content/post/poster-demo/index.mdx`（draft）。
