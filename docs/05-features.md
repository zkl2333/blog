# 核心功能说明

Astro Cactus 配备了一系列现代化的博客功能，帮助你建立一个完整的内容平台。

## 🎨 外观和交互

### 深色/浅色模式

- 自动根据系统设置切换主题
- 用户可手动切换
- 通过 `src/styles/global.css` 自定义配色

### 响应式设计

- 完全响应式布局
- 在手机、平板和桌面上都有最佳体验
- 使用 Tailwind CSS 构建

### 无障碍设计

- 语义化 HTML 结构
- 完整的 ARIA 标签支持
- 键盘导航支持

## 📝 内容功能

### Markdown 支持

- 完整的 Markdown 语法支持
- 支持扩展的 MDX（可选）
- 内置代码块高亮

### 代码块和高亮

使用 [Expressive Code](https://expressive-code.com/) 提供：

- 语法高亮支持 100+ 编程语言
- 代码行高亮和注释
- 代码文件名和标题
- 复制代码按钮

```javascript
// 这是高亮示例
const greeting = "Hello, World!";
console.log(greeting);
```

### Admonitions（提示框）

四种提示框类型：

> [!NOTE]
> **NOTE** - 一般信息

> [!TIP]
> **TIP** - 有用建议

> [!WARNING]
> **WARNING** - 警告信息

> [!DANGER]
> **DANGER** - 危险操作

### 草稿功能

设置 `draft: true` 可隐藏文章：

```yaml
---
draft: true
---
```

- 在开发环境中仍然可见
- 生产构建会自动过滤
- 便于保存未完成的文章

## 🔍 搜索和导航

### Pagefind 静态搜索

- 完全离线的静态搜索
- 无需后端或 API
- 支持按标签过滤
- 快速和可靠

**使用方法：**

```bash
pnpm build      # 构建网站
pnpm postbuild  # 生成搜索索引
pnpm preview    # 本地预览
```

### 标签系统

- 自动生成标签页面
- 支持多标签过滤
- 可创建自定义标签页说明

## 📊 SEO 优化

### 自动生成元数据

- Meta description
- Open Graph 标签
- Twitter Card 标签
- 结构化数据（JSON-LD）

### OG 图片生成

使用 [Satori](https://github.com/vercel/satori) 自动生成 Open Graph 图片：

- 每篇文章自动生成一张漂亮的分享卡片
- 支持自定义设计
- 可上传自定义图片覆盖

### Sitemap 和 Robots

- 自动生成 `sitemap.xml`
- 自动生成 `robots.txt`
- 便于搜索引擎爬取

## 📱 内容分发

### RSS 源

- 自动生成 RSS feed
- 支持订阅阅读器
- 实时更新文章

**订阅地址：** `/rss.xml`

### Web App Manifest

- 支持安装为桌面应用
- 自定义应用图标和名称
- 离线支持（可配置）

## 💬 评论和互动

### Webmentions

- 支持来自其他网站的提及
- 自动收集链接反向链接
- 增加内容互动性

**启用步骤：**

1. 在 [webmention.io](https://webmention.io/) 注册
2. 在你的网站 head 中添加 Webmention 链接
3. 其他博客链接到你的文章时会自动通知

详见：[Adding Webmentions](http://astro-cactus.chriswilliams.dev/posts/webmentions/)

## 🎯 分析和统计

### 集成分析

虽然模板本身不内置统计，但支持集成：

- **Vercel Analytics** - Vercel 托管专用
- **Netlify Analytics** - Netlify 托管专用
- **Cloudflare Web Analytics** - 免费且简单
- **Google Analytics** - 功能完整但需要 GDPR 合规
- **Plausible** - 隐私友好的分析
- **Umami** - 开源自托管分析

**集成方式：**

在 `src/layouts/Base.astro` 的 `<head>` 中添加分析脚本

## 🚀 性能优化

### 快速加载

- Astro 的静态生成（SSG）
- 零 JavaScript 默认配置（可选）
- 自动代码分割
- 图片优化

### 构建优化

- CSS-in-JS 优化
- HTML 压缩
- 资源内联和外链优化
- 预加载关键资源

## 🔐 安全特性

### 内容安全

- 没有用户输入的代码执行
- 静态生成的内容
- 不需要后端或数据库

### 隐私保护

- 没有 cookie 跟踪（默认）
- 没有第三方脚本（默认）
- 完全自托管

## 📦 集成和扩展

### Astro 生态

与 Astro 集成兼容：

- **UI 框架** - React, Vue, Svelte 等
- **CMS** - Contentful, Strapi 等
- **部署** - Netlify, Vercel, Cloudflare 等

### 开箱即用的集成

- Tailwind CSS - 样式框架
- Pagefind - 搜索
- Satori - OG 图片生成
- Expressive Code - 代码高亮

## 🎨 定制空间

所有功能都是可定制的：

- 修改样式 - `src/styles/global.css`
- 调整布局 - `src/layouts/`
- 自定义组件 - `src/components/`
- 扩展功能 - 添加 Astro 集成

## 功能对比表

| 功能     | 支持 | 说明               |
| -------- | ---- | ------------------ |
| Markdown | ✅   | 完整支持           |
| MDX      | ✅   | 支持 JSX           |
| 代码高亮 | ✅   | Expressive Code    |
| 搜索     | ✅   | Pagefind 静态搜索  |
| 标签系统 | ✅   | 自动生成和自定义   |
| 深色模式 | ✅   | 完整支持           |
| 评论     | ⚙️   | 可集成 Webmentions |
| 分析     | ⚙️   | 支持集成第三方     |
| SEO      | ✅   | 自动优化           |
| RSS      | ✅   | 自动生成           |

---

更多功能探索，请查看 [Astro 文档](https://docs.astro.build/)
