# 文章写作指南

## 文章位置

所有博客文章存放在：`src/content/post/`

文件名（去掉扩展名）会自动成为文章的 URL 路由。

```
src/content/post/
├── my-first-post.md           → yoursite.com/posts/my-first-post
├── hello-world.md             → yoursite.com/posts/hello-world
└── 2024-04-29-new-article.md  → yoursite.com/posts/2024-04-29-new-article
```

## 文章格式

每篇文章由两部分组成：

```markdown
---
title: "文章标题"
description: "文章描述"
publishDate: "2024-04-29T10:00:00Z"
updatedDate: "2024-04-30T10:00:00Z"
tags: ["tag1", "tag2"]
coverImage:
  src: "/images/cover.jpg"
  alt: "描述"
---

# 正文内容

你的文章内容从这里开始...
```

## Frontmatter 字段说明

### 必填字段 ⭐

| 字段 | 说明 | 示例 |
|------|------|------|
| **title** | 文章标题，最多 60 字符 | `"我的第一篇文章"` |
| **description** | SEO 描述，50-160 字符 | `"一篇关于 Astro 的介绍文章"` |
| **publishDate** | 发布时间，ISO 8601 格式 | `"2024-04-29T10:00:00Z"` |

### 可选字段 💡

| 字段 | 说明 | 示例 |
|------|------|------|
| **updatedDate** | 最后更新时间 | `"2024-04-30T10:00:00Z"` |
| **tags** | 标签数组 | `["javascript", "react"]` |
| **coverImage** | 封面图对象 | 见下方示例 |
| **ogImage** | 自定义 OG 图片路径 | `"/og-custom.png"` |
| **draft** | 是否为草稿（默认 false） | `true` |

### 日期格式

使用 ISO 8601 格式（带时区偏移）：

```yaml
publishDate: "2024-04-29T10:00:00Z"           # UTC
publishDate: "2024-04-29T10:00:00+08:00"     # 中国时间
publishDate: "2024-04-29T10:00:00-05:00"     # 美国东部
```

也支持简化格式：

```yaml
publishDate: "2024-04-29"                    # 仅日期
```

## 常用 Frontmatter 示例

### 基础文章

```markdown
---
title: "我的第一篇文章"
description: "这是一篇关于 Astro 的介绍文章，探讨其特点和用途。"
publishDate: "2024-04-29T10:00:00Z"
tags: ["astro", "web-development"]
---

# 正文内容开始

这里开始写你的文章内容...
```

### 带封面的文章

```markdown
---
title: "设计系统最佳实践"
description: "探讨如何构建可扩展的设计系统"
publishDate: "2024-04-29T10:00:00Z"
tags: ["design", "css"]
coverImage:
  src: "/images/design-system-cover.jpg"
  alt: "设计系统插图"
---
```

### 已更新的文章

```markdown
---
title: "React Hooks 完全指南"
description: "深入了解 React Hooks 的原理和最佳实践"
publishDate: "2024-03-15T10:00:00Z"
updatedDate: "2024-04-29T15:30:00Z"
tags: ["react", "hooks"]
---
```

### 草稿文章

```markdown
---
title: "未发布的想法"
description: "这是一篇还在写的文章"
publishDate: "2024-05-01T00:00:00Z"
draft: true
tags: ["wip"]
---

仍在编写中...生产构建会忽略此文章。
```

## Markdown 写作

### 基本语法

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本**
*斜体文本*
***加粗斜体***

- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2

[链接文本](https://example.com)
![图片描述](./image.jpg)

> 引用文本

`代码片段`

\`\`\`javascript
// 代码块
const hello = "world";
\`\`\`
```

### 代码高亮

使用 Expressive Code 提供的高亮功能：

````markdown
```javascript title="example.js" {2-3}
const greeting = "Hello";
const name = "World";
console.log(`${greeting}, ${name}!`);
```
````

支持的语言：JavaScript, TypeScript, Python, HTML, CSS, 等等

### Admonitions（提示框）

```markdown
> [!NOTE]
> 这是一个注意事项

> [!WARNING]
> 这是一个警告

> [!TIP]
> 这是一个提示

> [!DANGER]
> 这是危险信息
```

## MDX 扩展（可选）

如果使用 `.mdx` 扩展，可以在 Markdown 中直接写 JSX 组件：

```mdx
# 我的交互式文章

import { Counter } from '../components/Counter.astro'

<Counter client:load />
```

## 最佳实践

1. **清晰的标题** - 使用有描述性的文件名和 title
2. **有用的描述** - description 是 SEO 关键，要准确总结内容
3. **合理的标签** - 使用 2-5 个相关标签，便于分类
4. **一致的日期** - 使用一致的日期格式和时区
5. **优化 OG 图片** - 社交分享时会用到
6. **定期更新** - 使用 `updatedDate` 标记修改

## 快速创建片段

### VS Code Snippet

在 VS Code 中输入 `frontmatter` 快捷键自动生成：

```yaml
---
title: 
description: 
publishDate: 
---
```

按 `Ctrl+Space`（Windows）或 `⌃Space`（Mac）触发智能提示。

## 常见问题

**Q: 为什么文章没有显示？**
A: 检查 `draft` 是否设为 true，或者 `publishDate` 是否是未来日期。

**Q: 如何排序文章？**
A: 默认按 `publishDate` 倒序显示。可以编辑列表页的排序逻辑。

**Q: 可以使用 HTML 吗？**
A: 可以，在 Markdown 中直接写 HTML 代码即可。

下一步：[笔记写作](./notes.md) | [标签管理](./tags.md)
