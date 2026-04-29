---
title: "Markdown 提示块（Admonitions）"
description: "这篇文章演示如何在 Astro Cactus 中使用 Markdown 提示块（admonition）功能"
publishDate: "25 Aug 2024"
updatedDate: "4 July 2025"
tags: ["markdown", "admonitions"]
draft: true
---

## 什么是 Admonitions

Admonitions（也常被称为 “asides”）适合用来补充说明、强调重点，或给读者提供与正文相关的辅助信息。

## 如何使用

在 Astro Cactus 中使用 admonitions 的方法是：用一对三冒号 `:::` 包裹你的 Markdown 内容。第一行还需要标明你要使用的提示类型。

例如，下面这段 Markdown：

```md
:::note
需要读者注意的信息，即使快速浏览也别错过。
:::
```

会渲染为：

:::note
需要读者注意的信息，即使快速浏览也别错过。
:::

## 支持的类型

目前支持以下类型：

- `note`
- `tip`
- `important`
- `warning`
- `caution`

### Note（提示）

```md
:::note
需要读者注意的信息，即使快速浏览也别错过。
:::
```

:::note
需要读者注意的信息，即使快速浏览也别错过。
:::

### Tip（建议）

```md
:::tip
可选信息：帮助读者更顺利地完成目标。
:::
```

:::tip
可选信息：帮助读者更顺利地完成目标。
:::

### Important（重要）

```md
:::important
关键信息：读者要成功完成目标必须知道的内容。
:::
```

:::important
关键信息：读者要成功完成目标必须知道的内容。
:::

### Caution（注意）

```md
:::caution
注意：某个操作可能带来的负面后果。
:::
```

:::caution
注意：某个操作可能带来的负面后果。
:::

### Warning（警告）

```md
:::warning
警告：由于潜在风险，需要读者立即关注的重要内容。
:::
```

:::warning
警告：由于潜在风险，需要读者立即关注的重要内容。
:::

## 自定义提示块标题

你可以用下面的写法自定义标题：

```md
:::note[我的自定义标题]
这是一条带有自定义标题的提示。
:::
```

渲染结果：

:::note[我的自定义标题]
这是一条带有自定义标题的提示。
:::

## GitHub Repository Cards

你可以添加指向 GitHub 仓库的动态卡片。页面加载时，卡片信息会从 GitHub API 拉取。

::github{repo="chrismwilliams/astro-theme-cactus"}

也可以链接到某个 GitHub 用户：

::github{user="withastro"}

使用方式就是写 `github` 指令：

```markdown title="Linking a repo"
::github{repo="chrismwilliams/astro-theme-cactus"}
```

```markdown title="Linking a user"
::github{user="withastro"}
```
