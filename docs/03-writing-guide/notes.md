# 笔记写作指南

## 笔记位置

所有笔记存放在：`src/content/note/`

笔记的文件名会自动成为笔记的 URL 路由。

```
src/content/note/
├── learning-astro.md        → yoursite.com/notes/learning-astro
├── book-summary.md          → yoursite.com/notes/book-summary
└── quick-tips.md            → yoursite.com/notes/quick-tips
```

## 笔记格式

笔记比文章更简洁，通常用于记录临时想法、学习笔记或收集内容。

```markdown
---
title: "笔记标题"
description: "笔记描述"
publishDate: "2024-04-29T10:00:00Z"
---

# 笔记内容

你的笔记内容从这里开始...
```

## Frontmatter 字段说明

### 必填字段 ⭐

| 字段 | 说明 | 示例 |
|------|------|------|
| **title** | 笔记标题，最多 60 字符 | `"React Hooks 学习笔记"` |
| **publishDate** | 发布日期，ISO 8601 格式 | `"2024-04-29T10:00:00Z"` |

### 可选字段 💡

| 字段 | 说明 | 示例 |
|------|------|------|
| **description** | SEO 描述和摘要 | `"关键概念和用法总结"` |

## 笔记示例

### 简单笔记

```markdown
---
title: "CSS Flexbox 速查表"
publishDate: "2024-04-29T10:00:00Z"
description: "Flexbox 常用属性和值的快速参考"
---

## 容器属性

- `display: flex` - 启用 flexbox
- `flex-direction` - 方向（row | column）
- `justify-content` - 主轴对齐
- `align-items` - 交叉轴对齐

## 项目属性

- `flex: 1` - 自动填充空间
- `order` - 改变顺序
- `align-self` - 单独对齐
```

### 学习笔记

```markdown
---
title: "JavaScript 异步编程"
publishDate: "2024-04-29T10:00:00Z"
description: "Promise、async/await 的学习总结"
---

## 核心概念

### Promise
Promise 是一个代表异步操作最终完成（或失败）及其结果值的对象。

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("完成!"), 1000);
});
\`\`\`

### Async/Await
更简洁的异步代码写法。

\`\`\`javascript
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## 常见陷阱

1. 忘记 await
2. 没有正确处理错误
3. 阻塞性操作
```

### 阅读笔记

```markdown
---
title: "《深入浅出 React 和 Redux》读书笔记"
publishDate: "2024-04-20T10:00:00Z"
description: "核心概念和关键要点总结"
---

## 第一章：React 基础

### 组件化思想

React 将 UI 分解为独立、可复用的组件，每个组件管理自己的状态。

### JSX 语法

JSX 是 JavaScript 的扩展，让我们可以在 JS 中写类似 HTML 的代码。

## 关键收获

- [ ] 理解虚拟 DOM 的作用
- [ ] 掌握 React 生命周期
- [ ] 学会使用 Hooks
```

## Markdown 功能

笔记支持文章中的所有 Markdown 功能：

- **代码高亮** - 使用 Expressive Code
- **Admonitions** - 提示框
- **列表** - 有序、无序和嵌套
- **引用** - 块引用
- **链接和图片** - 完全支持

## 笔记 vs 文章

| 特性 | 文章 | 笔记 |
|------|------|------|
| 位置 | `src/content/post/` | `src/content/note/` |
| 完整性 | 完整的长篇内容 | 简洁的快速记录 |
| 标签 | 支持 | 不支持 |
| 封面 | 支持 | 不支持 |
| 更新日期 | 支持 | 不支持 |
| OG 图片 | 支持自定义 | 默认生成 |
| 目的 | 正式发布 | 知识积累 |

## 最佳实践

1. **清晰的标题** - 一眼能看出笔记内容
2. **有用的摘要** - 在 description 中简述要点
3. **结构清晰** - 使用标题分节，便于快速查找
4. **保持更新** - 笔记可以随时补充修改
5. **连接相关** - 在笔记中链接相关文章或其他笔记

## 使用场景

✅ **适合笔记**
- 学习笔记和总结
- 代码片段收集
- 快速参考
- 书籍摘录
- 项目文档

❌ **不适合笔记**
- 需要展示的正式内容 → 用文章
- 需要标签分类 → 用文章
- 需要社交分享优化 → 用文章

下一步：[标签管理](./tags.md) | [回到写作指南](./README.md)
