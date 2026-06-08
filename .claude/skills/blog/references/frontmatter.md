# Frontmatter Schema

博客仓库的 content collection schema 定义在 `src/content.config.ts`。

## post collection 完整字段

```yaml
---
# ── 必填 ──────────────────────────────────────
title: "标题"                # 上限 60 字符，schema 强制
description: "描述"          # 用于列表卡片 + meta description + OG
publishDate: "2026-05-14"    # ISO 日期或 yyyy-mm-dd 字符串

# ── 推荐 ──────────────────────────────────────
tags: ["tag1", "tag2"]       # 数组；schema 强制 toLowerCase + 去重

# ── 可选 ──────────────────────────────────────
updatedDate: "2026-05-15"    # 改文章时加，列表显示 "updated"
draft: false                 # 默认 false。true 时本地能看但 PROD 不出
pinned: false                # 置顶卡片
coverImage:                  # 显式封面图。不写时会自动从正文第一张图提取
  alt: "图片描述"
  src: "./cover.png"         # 相对路径，必须在 post 同目录
ogImage: "/path.png"         # 覆盖自动生成的 OG 图（一般不用）
---
```

## 字段细节

### `title`
- **上限 60 字符**（Zod 强制 `.max(60)`），超出 schema validation 失败
- 中文混英文都行，标题里出现的英文术语保留原大小写
- 例：`"在 250×122 像素的墨水屏上写 JSX"`、`"翻出书架上的树莓派，和 Claude 一晚上把它玩起来"`

### `description`
- **1-3 句**，**强烈建议**放点钩子和具体细节，不要纯抽象
- 用在三处：列表卡片 subtitle / `<meta name="description">` / OG card 副标题
- 例（带细节有钩子）：
  > "翻出来的 Pi Zero 2W 已经能用墨水屏显示状态了，但渲染层是 imperative PIL——我作为前端不熟。睡前躺床上随手起念，两个晚上 + 一些工作缝隙，把渲染管线从 PIL 改成了 JSX + flexbox。两个 AI 协作、23 个 commit、最后 squash 进 main。这篇博客也是 AI 写的。"

### `publishDate`
- 格式：`"YYYY-MM-DD"`（推荐）或完整 ISO 8601
- 不要用过去/未来的"占位"日期，CI 会按这个排序
- 同一天多篇文章按字典序排

### `tags`
- 数组，全小写（schema 自动转换）
- 单个 tag 用 kebab-case（如 `raspberry-pi`、`claude-code`，不是 `RaspberryPi`）
- 重复的 tag 自动去重
- **同主题用同一个 tag**（看现有 tag 列表，不要随便造新的）：
  - Hermes 系列：`hermes-agent`（不是 `hermes` / `hermes-curator`）
  - Pi 系列：`raspberry-pi`、`e-paper`、`pisugar`
  - AI 系列：`ai`、`claude-code`
  - 工具栈：`homelab`、`deep-dive`
- 单篇 5-7 个 tag 比较合适

### `coverImage`（可选）
- **不写也行**——本仓库已支持自动 fallback（详见 [images.md](images.md)）
- 写的话：`src` 是**相对路径**（`./xxx.png`），文件必须在 post 同目录
- `alt` 是可访问性必须，写一句话描述图

### `updatedDate`（可选）
- 只在**实质性**修改（内容、事实、结构）时加；typo 修复不必加
- 加了之后会显示 "updated YYYY-MM-DD"

### `draft`（可选）
- 本地 `pnpm dev` 时可见，`pnpm build`（PROD）时排除
- 写一半未发布的文章用这个，比删除好

### `pinned`（可选）
- 列表页置顶
- 一次最多 1-2 篇，太多失去意义

### `ogImage`（可选）
- **一般不用**——OG 图会通过 `src/pages/og-image/[slug].png.ts` 自动用 satori 生成
- 只有当自动 OG 不满意时才显式指定

## 文件结构

**推荐文件夹结构**（便于图片共置）：

```
src/content/post/<slug>/
├── index.md          # 文章正文
├── cover.png         # 封面图（如果有显式 coverImage）
├── inline-1.png      # 内联图
└── ...
```

**也支持平铺**（无图或纯文本时）：

```
src/content/post/<slug>.md
```

## slug 命名

- **kebab-case**
- 能直接看出主题（避免 `post-1`、`new-post` 之类）
- 不要带日期前缀（日期在 frontmatter 里）
- 长度 2-5 个词
- 例：
  - ✅ `eink-render-jsx`、`home-pi-revival`、`hermes-curator`
  - ❌ `1057`（兼容老博客的迁移文章，新文章不要这样）、`my-new-blog-post`

## 验证 schema

写完 frontmatter 跑一下：

```bash
cd <blog-repo> && pnpm exec astro check
```

如果 frontmatter 不符合 schema 会报错，定位非常精确。

## 常见错误

| 错误 | 原因 | 修法 |
|---|---|---|
| `String must contain at most 60 character(s)` | title 超长 | 砍标题 |
| `Invalid input` 在 publishDate | 日期格式错 | 用 `"YYYY-MM-DD"` 字符串 |
| `Could not find image at ./cover.png` | coverImage src 路径错 | 文件必须在 post 同目录 |
| `Expected object, received string` 在 coverImage | 写成了 `coverImage: "./cover.png"` | 必须是 `{ alt, src }` 对象 |
