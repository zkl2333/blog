# Astro Cactus 编写指南

欢迎来到 Astro Cactus 博客编写指南！本指南将帮助你快速上手，了解如何创建和管理博客内容。

## 📚 目录导航

1. **[快速开始](./01-getting-started/README.md)** - 项目初始化和基本命令
2. **[配置指南](./02-configuration/README.md)** - 站点配置、主题定制等
3. **[写作指南](./03-writing-guide/)** - 详细的内容创建说明
   - [文章写作](./03-writing-guide/posts.md)
   - [笔记写作](./03-writing-guide/notes.md)
   - [标签管理](./03-writing-guide/tags.md)
4. **[示例文章](./04-examples/)** - 真实示例供参考
5. **[功能说明](./05-features.md)** - 博客的核心功能介绍
6. **[部署指南](./06-deployment.md)** - 部署到生产环境

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 💡 核心特性

- ⚡ Astro v6 + Tailwind v4（快速构建）
- 🌙 深色/浅色模式
- 📝 支持 Markdown 和 MDX
- 🔍 Pagefind 静态搜索
- 📱 响应式设计
- 🎨 自动生成 OG 图片
- 📡 RSS 源
- 🔗 Webmentions 评论支持

## 📝 内容结构

```
src/content/
├── post/          # 博客文章
├── note/          # 笔记内容
└── tag/           # 标签说明页（可选）
```

## 🎯 接下来

- 查看 [快速开始](./01-getting-started/README.md) 了解如何配置项目
- 阅读 [写作指南](./03-writing-guide/) 开始创建内容
- 参考 [示例文章](./04-examples/) 了解 frontmatter 用法
