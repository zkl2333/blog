# 标签管理指南

## 标签系统

标签系统帮助你分类和组织文章内容，方便读者按主题浏览。

## 如何使用标签

### 在文章中添加标签

在文章的 frontmatter 中使用 `tags` 字段：

```markdown
---
title: "学习 React Hooks"
description: "深入理解 React Hooks 的原理"
publishDate: "2024-04-29T10:00:00Z"
tags: ["react", "hooks", "javascript"]
---
```

### 标签自动生成

- 当你在文章中使用标签时，Astro Cactus 会自动创建：
  - `/tags/react` - 该标签的文章列表页
  - `/tags/hooks` - 该标签的文章列表页
  - `/tags` - 所有标签的浏览页

## 标签最佳实践

### ✅ 推荐

- **使用小写字母** - `javascript` 而非 `JavaScript`
- **使用连字符分隔** - `web-development` 而非 `web_development`
- **保持简洁** - 单词清晰易记
- **保持一致** - 相同概念使用相同标签

```markdown
tags: ["javascript", "web-development", "frontend"]
```

### ❌ 避免

- **过多标签** - 每篇文章 2-5 个标签即可
- **过于具体** - `react-hooks-useState-usage` 太长
- **拼写不一致** - 同时使用 `js` 和 `javascript`
- **重复标签** - `javascript` 和 `javascript-tips`

## 自定义标签页面

### 为标签创建自定义页面

如果你想为某个标签写自定义说明或介绍，可以在 `/src/content/tag/` 下创建同名文件：

```
src/content/tag/
├── react.md
├── javascript.md
├── web-development.md
└── ...
```

### 标签页面示例

创建 `src/content/tag/react.md`：

```markdown
---
title: "React"
description: "关于 React 框架的所有文章"
---

# React

React 是一个用于构建用户界面的 JavaScript 库。本页面收集了所有关于 React 的文章。

## 核心主题

- 组件和 Props
- 状态管理
- Hooks
- 性能优化
- 生态系统

## 推荐阅读顺序

1. React 基础概念
2. 学习 Hooks
3. 深入状态管理
4. 性能优化技巧
```

### 标签页 Frontmatter

| 字段            | 说明       | 必填                 |
| --------------- | ---------- | -------------------- |
| **title**       | 标签页标题 | 否（默认使用文件名） |
| **description** | 标签页描述 | 否                   |

## 标签分类示例

### 按技术栈

```markdown
tags: ["javascript", "react", "typescript", "tailwind"]
```

### 按内容类型

```markdown
tags: ["tutorial", "tips", "best-practices", "case-study"]
```

### 混合使用

```markdown
tags: ["react", "hooks", "performance", "tutorial"]
```

## 标签命名规范

### Web 开发

| 标签         | 用途                |
| ------------ | ------------------- |
| `javascript` | JavaScript 语言相关 |
| `typescript` | TypeScript 相关     |
| `react`      | React 框架          |
| `vue`        | Vue 框架            |
| `astro`      | Astro 框架          |
| `css`        | CSS 样式            |
| `html`       | HTML 标签和结构     |
| `frontend`   | 前端通用            |
| `backend`    | 后端相关            |
| `devops`     | 部署和工具          |

### 内容类型

| 标签             | 用途       |
| ---------------- | ---------- |
| `tutorial`       | 教程和指南 |
| `tips`           | 快速技巧   |
| `best-practices` | 最佳实践   |
| `case-study`     | 案例分析   |
| `review`         | 工具评测   |
| `news`           | 新闻和动态 |

### 通用标签

| 标签            | 用途     |
| --------------- | -------- |
| `performance`   | 性能优化 |
| `security`      | 安全相关 |
| `accessibility` | 无障碍   |
| `testing`       | 测试     |
| `documentation` | 文档     |

## 查看标签

### 在站点中

1. **标签列表** - 访问 `/tags` 查看所有标签
2. **标签页面** - 访问 `/tags/[tagname]` 查看该标签的文章
3. **搜索过滤** - 在搜索结果中按标签过滤

### 在代码中

所有标签会自动收集在 `getAllTags()` 函数中，无需手动维护。

## 常见场景

### 场景1：我想按技术栈分类

```markdown
---
tags: ["react", "hooks", "javascript"]
---
```

然后在 `src/content/tag/react.md` 中创建一个标签介绍页。

### 场景2：我想按难度分类

```markdown
---
tags: ["javascript", "beginner-friendly"]
---
```

### 场景3：我想实现多分类系统

可以创建多个维度的标签：

```markdown
---
tags:
  - "javascript" # 技术
  - "tutorial" # 类型
  - "beginner-friendly" # 难度
  - "2024" # 年份
---
```

## 管理和整理

### 定期检查

1. 列出所有已用标签
2. 检查拼写和一致性
3. 合并相似标签
4. 删除不用的标签

### 重构标签

如果要重命名标签（例如 `js` 改为 `javascript`）：

1. 在所有文章中搜索替换旧标签
2. 删除旧标签页面（如果有）
3. 创建新标签页面（如果需要）

```bash
# 使用编辑器全文替换，或者用命令行
find src/content -type f -exec sed -i 's/- js/- javascript/g' {} \;
```

## 下一步

- 👀 [查看示例文章](../../04-examples/)
- 📖 [回到写作指南](./README.md)
