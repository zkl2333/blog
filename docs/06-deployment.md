# 部署指南

将你的 Astro Cactus 博客部署到生产环境。

## 部署前清单

在部署之前，确保：

- [ ] `src/site.config.ts` 中的 `url` 已更新为正确域名
- [ ] 社交链接已配置
- [ ] Logo 和社交卡片已替换
- [ ] 内容已验证（本地 `pnpm preview`）
- [ ] 构建成功（无错误）
- [ ] 搜索索引已生成（`pnpm postbuild`）

## 构建命令

```bash
# 构建生产版本
pnpm build

# 生成搜索索引（重要！）
pnpm postbuild

# 本地预览最终产物
pnpm preview
```

构建输出目录：`./dist/`

## 平台部署

### 推荐部署平台

#### 🎯 Netlify（推荐）

Netlify 提供简单的一键部署和自动持续集成。

**优点：**
- 一键部署
- 自动 HTTPS
- 自动预构建和部署
- 免费 SSL 证书
- 简单的自定义域名设置

**部署步骤：**

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 登录 [Netlify](https://www.netlify.com)
3. 点击 "New site from Git"
4. 连接你的代码仓库
5. 设置构建命令：

```
Build command: pnpm build && pnpm postbuild
Publish directory: dist
```

6. 点击 "Deploy site"

**使用一键部署按钮：**

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/chrismwilliams/astro-theme-cactus)

#### 🔷 Vercel

Vercel 对 Astro 有很好的支持，提供边缘计算和分析。

**优点：**
- 集成 Vercel Analytics
- 边缘部署
- 自动预览链接
- 高性能

**部署步骤：**

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 导入项目
4. 修改 Build Command 为：

```
pnpm build && pnpm postbuild
```

5. 点击 Deploy

**使用一键部署：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchrismwilliams%2Fastro-theme-cactus&project-name=astro-theme-cactus)

#### ☁️ Cloudflare Pages

Cloudflare Pages 提供全球 CDN 和免费的边缘计算。

**优点：**
- 完全免费
- 全球 CDN
- 集成 Cloudflare 服务
- 高性能

**部署步骤：**

1. 将代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 "Pages"
4. 点击 "Create a project"
5. 连接 GitHub 仓库
6. 设置构建命令：

```
Build command: pnpm build && pnpm postbuild
Build output directory: dist
```

7. 部署

#### 🚀 其他平台

- **Render** - 简单易用
- **Railway** - 开发者友好
- **GitHub Pages** - 免费但有限制
- **自托管** - 完全控制

详见：[Astro 部署文档](https://docs.astro.build/en/guides/deploy/)

## 配置自定义域名

### Netlify

1. 在 Netlify 设置中进入 "Domain management"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照说明配置 DNS 记录
5. 自动 HTTPS 配置（免费）

### Vercel

1. 在项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 配置 DNS 记录
4. 自动 HTTPS（免费）

### Cloudflare

1. 添加你的域名到 Cloudflare
2. 更新域名 nameservers
3. 在 Cloudflare Dashboard 配置 Pages
4. 关联你的域名
5. 自动 HTTPS（免费）

## 持续集成和部署（CI/CD）

大多数平台都支持自动部署：

- **推送到 main 分支** → 自动构建和部署
- **创建 PR** → 自动生成预览链接
- **推送到其他分支** → 自动部署到测试环境

### GitHub Actions（自托管选项）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Generate search
        run: pnpm postbuild
      
      - name: Deploy
        # 根据你的部署服务配置
        run: |
          # 你的部署命令
```

## 环境变量

如果你需要环境变量（如分析脚本）：

1. 在平台的设置中添加环境变量
2. 在 `astro.config.ts` 中使用：

```typescript
const analyticsId = process.env.ANALYTICS_ID;
```

## 性能优化提示

### 图片优化

```bash
# 安装 sharp（推荐用于生产）
pnpm add sharp
```

### 缓存策略

配置 HTTP 缓存头：

- 静态资源：1 年缓存
- HTML 文件：不缓存或短期缓存
- 搜索索引：短期缓存

### 监控性能

使用工具测试性能：

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

目标指标：

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1

## 故障排除

### 构建失败

1. 检查构建日志
2. 确保所有依赖已安装
3. 验证 `src/site.config.ts` 配置
4. 检查 Node.js 版本（`.nvmrc`）

### 搜索不工作

确保运行了 `pnpm postbuild` 来生成搜索索引。

### 样式丢失

- 检查 CSS 构建是否成功
- 验证 Tailwind 配置
- 清除浏览器缓存

### 404 错误

- 验证文件名和 slug
- 检查 URL 结构
- 查看构建日志中的路由信息

## 上线后维护

### 定期检查

- 检查错误日志
- 监控性能指标
- 验证 SEO 结果

### 持续更新内容

- 定期发布新文章
- 更新旧文章
- 管理标签系统

### 备份

定期备份：

1. **Git 代码** - 已通过 GitHub 保存
2. **内容** - 存储在 `src/content/` 中
3. **配置** - 在 git 中追踪

## 下一步

- 📖 [快速开始](./01-getting-started/)
- 🎨 [配置指南](./02-configuration/)
- ✍️ [写作指南](./03-writing-guide/)

---

部署成功后，你就拥有一个完整的、高性能的博客了！🎉
