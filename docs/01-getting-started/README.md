# 快速开始

## 项目初始化

### 方式1：基于模板创建

```bash
# 使用 pnpm
pnpm create astro@latest -- --template chrismwilliams/astro-theme-cactus

# 或使用 dlx
pnpm dlx create-astro --template chrismwilliams/astro-theme-cactus
```

### 方式2：现有项目

如果你已经克隆了仓库，只需：

```bash
pnpm install
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装项目依赖 |
| `pnpm dev` | 启动本地开发服务器（localhost:3000） |
| `pnpm build` | 构建生产版本到 `./dist/` |
| `pnpm postbuild` | 运行 Pagefind，生成搜索索引 |
| `pnpm preview` | 预览构建产物 |
| `pnpm sync` | 根据 schema 生成类型 |

## 开发工作流

1. **启动开发环境**
   ```bash
   pnpm dev
   ```
   访问 `http://localhost:3000` 即可看到实时预览

2. **创建新内容**
   - 在 `src/content/post/` 创建 `.md` 或 `.mdx` 文件
   - 在 `src/content/note/` 创建笔记文件
   - 详见 [写作指南](../03-writing-guide/)

3. **测试和构建**
   ```bash
   pnpm build      # 构建站点
   pnpm postbuild  # 生成搜索索引
   pnpm preview    # 本地预览产物
   ```

## 文件结构速览

```
project/
├── src/
│   ├── content/           # 内容目录（文章、笔记、标签）
│   ├── layouts/           # 页面布局组件
│   ├── components/        # 可复用组件
│   ├── styles/            # 全局样式
│   ├── site.config.ts     # 站点配置（重要！）
│   └── pages/             # 页面和路由
├── public/                # 静态资源
├── astro.config.ts        # Astro 配置
├── tailwind.config.ts     # Tailwind 配置
└── package.json           # 依赖和脚本

```

## 关键提示 ⚠️

1. **必须修改 `src/site.config.ts`**
   - 更新 `url` 为你的域名
   - 这是必须的！

2. **替换品牌资源**
   - `/public/icon.svg` - 网站图标
   - `/public/social-card.png` - 默认 OG 图片

3. **检查开发环境**
   - 确保 Node.js 版本合适（检查 `.nvmrc`）
   - 使用 pnpm 包管理器

## 下一步

- 📖 [配置站点](../02-configuration/README.md)
- ✍️ [开始写作](../03-writing-guide/)
