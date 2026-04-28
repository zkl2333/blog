# Repository Guidelines

## 项目结构与模块组织

这是一个基于 Astro 的博客/站点仓库。应用代码位于 `src/`：页面在 `src/pages`，可复用 UI 在 `src/components`，布局在 `src/layouts`，通用工具在 `src/utils`，内容集合在 `src/content/{post,note,tag}`。站点级配置定义在 `src/site.config.ts` 与 `src/content.config.ts`。需要原样输出的静态资源放在 `public/`；字体等源码资源放在 `src/assets/`。

## 构建、测试与开发命令

本地开发统一使用 `pnpm`。

- `pnpm install`：安装依赖。
- `pnpm dev`：启动本地 Astro 开发服务器。
- `pnpm build`：构建生产站点到 `dist/`。
- `pnpm postbuild`：在构建完成后生成 Pagefind 搜索索引。
- `pnpm preview`：本地预览构建产物。
- `pnpm check`：运行 `astro check` 和 `biome check`。
- `pnpm lint`：执行 Biome 自动修复（在可修复范围内）。
- `pnpm format`：使用 Prettier 格式化整个仓库。

## 代码风格与命名约定

优先遵循仓库现有格式化工具，不要手动维持格式。`.editorconfig` 规定使用 LF、UTF-8 和 2 空格缩进；Biome 实际会以制表符和 100 字符行宽格式化代码，因此以格式化输出为准。Astro 组件文件使用 `PascalCase`，如 `BaseHead.astro`；工具模块使用 `camelCase`，如 `generateToc.ts`；内容 slug 使用小写 kebab-case。共享工具中尽量显式声明类型，页面路由文件名需遵循 Astro 约定，例如 `[...slug].astro`。

## 测试指南

当前仓库还没有独立的单元测试套件。提交 PR 前，至少将 `pnpm check` 和 `pnpm build` 作为必跑校验。若改动涉及内容集合 schema、路由或 remark 插件，请在 `pnpm dev` 或 `pnpm preview` 中手动验证受影响页面，并确认上述命令全部通过。

## 提交与 Pull Request 规范

最近的提交历史采用简洁的 Conventional Commit 风格，例如 `docs: 汉化站点文案`、`chore(deps): 🤖 升级 astro 及 @astrojs 依赖`。请保留类型前缀，如 `docs`、`chore`、`ci`、`feat`、`fix`，并让主题聚焦单一改动。PR 需要概述改动内容；如果关联 issue，请使用 `Closes #123`；若涉及 UI 或样式调整，请按 `.github/pull_request_template.md` 要求附上前后对比截图。

## GitHub 协作与自动化

`.github/` 保存仓库协作规则与自动化配置。

- `.github/workflows/ci.yml`：在推送到 `main` 和针对 `main` 的 PR 上安装依赖、执行 `astro check` 并验证站点可构建。
- `.github/workflows/deploy.yml`：在 `main` 更新或手动触发时构建站点，并发布到 GitHub Pages。
- `.github/workflows/stale.yml`：定期标记长期无活动的 issue 和 PR，并按配置自动关闭 stale issue。

提交前请参考 `.github/pull_request_template.md` 补齐变更说明、关联 issue 和必要截图；依赖升级策略由 `.github/dependabot.yml` 管理，调整依赖维护方式时应同步更新。

## 部署与内容注意事项

GitHub Actions 会在推送到 `main` 以及针对 `main` 的 PR 上运行 CI，并从 `main` 部署到 GitHub Pages。不要提交 `dist/` 或 `.astro/`。修改内容时，请确保 frontmatter 与 `src/content.config.ts` 保持一致，避免类型生成或构建失败。
