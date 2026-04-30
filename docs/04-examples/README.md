# 示例文章

这个目录收录了从项目中整合的示例文章，展示了博客各种功能的用法。

## 📄 示例列表

| 文件                                           | 说明                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| [markdown-elements.md](./markdown-elements.md) | Markdown 完整语法演示，包含标题、列表、代码块、表格等 |
| [admonitions.md](./admonitions.md)             | 提示块（note/tip/warning/caution）用法示例            |
| [cover-image.md](./cover-image.md)             | 如何为文章添加封面图（coverImage frontmatter）        |
| [social-image.md](./social-image.md)           | 如何使用自定义 OG 社交分享图（ogImage frontmatter）   |
| [webmentions.md](./webmentions.md)             | Webmentions 完整接入指南                              |
| [long-title.md](./long-title.md)               | 超长标题的样式测试示例                                |
| [draft-post.md](./draft-post.md)               | 草稿功能（draft: true）说明                           |

## 🖼️ 示例图片

| 文件                     | 用途                                  |
| ------------------------ | ------------------------------------- |
| [logo.png](./logo.png)   | markdown-elements.md 中引用的示例图片 |
| [cover.png](./cover.png) | cover-image.md 中引用的封面图         |

## 如何参考这些示例

1. **复制 frontmatter** - 把对应示例的 frontmatter 部分复制到你的新文章中
2. **参照内容结构** - 查看示例的正文如何组织 Markdown 内容
3. **理解功能用法** - 每篇示例都专注演示某一功能

## 核心 Frontmatter 速查

### 文章（post）

```yaml
---
title: "文章标题" # 必填，最多 60 字符
description: "文章描述" # 必填，50-160 字符
publishDate: "2024-04-29" # 必填
updatedDate: "2024-05-01" # 可选
tags: ["tag1", "tag2"] # 可选
coverImage: # 可选
  src: "./cover.jpg"
  alt: "封面描述"
ogImage: "/custom-og.png" # 可选，跳过自动生成
draft: true # 可选，草稿模式
---
```

### 笔记（note）

```yaml
---
title: "笔记标题" # 必填，最多 60 字符
publishDate: "2024-04-29" # 必填
description: "笔记描述" # 可选
---
```

### 标签页（tag）

```yaml
---
title: "标签名" # 可选
description: "标签说明" # 可选
---
```
