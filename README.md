<div align="center">
  <img alt="Astro Cactus logo" src="https://github.com/user-attachments/assets/92dfbabf-ca65-4bf6-991d-9a71e5319880" width="70" />
</div>
<h1 align="center">
  Astro Cactus
</h1>

Astro Cactus 是一个基于 [Astro](https://astro.build) 构建的、带有明确取向的简洁脚手架。你可以用它快速搭建一个易用的博客或网站。

## 目录

1. [主要特性](#key-features)
2. [演示](#demo-)
3. [快速开始](#quick-start)
4. [预览](#preview)
5. [命令](#commands)
6. [配置](#configure)
7. [更新](#updating)
8. [添加文章、笔记与标签](#adding-posts-notes-and-tags)
   - [文章 Frontmatter](#post-frontmatter)
   - [笔记 Frontmatter](#note-frontmatter)
   - [标签 Frontmatter](#tag-frontmatter)
   - [Frontmatter 代码片段](#frontmatter-snippets)
9. [Pagefind 搜索](#pagefind-search)
10. [统计分析](#analytics)
11. [部署](#deploy)
12. [致谢](#acknowledgment)

<a id="key-features"></a>
## 主要特性

- Astro v6（快速 🚀）
- Tailwind v4
- 语义化、可访问的 HTML 结构
- 响应式布局与 SEO 友好
- 深色/浅色模式
- 支持 MD 与 [MDX](https://docs.astro.build/en/guides/markdown-content/#mdx-only-features) 的文章与笔记
  - 内置 [Admonitions](https://astro-cactus.chriswilliams.dev/posts/markdown-elements/admonitions/)
- 使用 [Satori](https://github.com/vercel/satori) 生成 Open Graph PNG 图片
- [自动生成 RSS](https://docs.astro.build/en/guides/rss)
- [Webmentions](https://webmention.io/)
- 自动生成：
  - [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
  - [robots.txt](https://github.com/alextim/astro-lib/blob/main/packages/astro-robots-txt/README.md)
  - [Web App Manifest](https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md)
- 集成 [Pagefind](https://pagefind.app/) 静态搜索库
- [Astro Icon](https://github.com/natemoo-re/astro-icon) SVG 图标组件
- [Expressive Code](https://expressive-code.com/) 代码块与语法高亮

<a id="demo-"></a>
## 演示 💻

查看部署在 Netlify 上的 [Demo](https://astro-cactus.chriswilliams.dev/)。

<a id="quick-start"></a>
## 快速开始

基于该模板[创建一个新仓库](https://github.com/chrismwilliams/astro-theme-cactus/generate)。

```bash
# pnpm 7+
pnpm create astro@latest -- --template chrismwilliams/astro-theme-cactus

# pnpm
pnpm dlx create-astro --template chrismwilliams/astro-theme-cactus
```

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/chrismwilliams/astro-theme-cactus) [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchrismwilliams%2Fastro-theme-cactus&project-name=astro-theme-cactus)

<a id="preview"></a>
## 预览

![Astro Theme Cactus in a light theme mode](https://github.com/chrismwilliams/astro-theme-cactus/assets/12715988/84c89d42-4525-4674-b10c-6d6ebdc06382)

![Astro Theme Cactus in a dark theme mode](https://github.com/chrismwilliams/astro-theme-cactus/assets/12715988/e0e575e2-445f-4c2d-a812-b5b53d2d9031)

<a id="commands"></a>
## 命令

把 `pnpm` 替换成你使用的包管理器（pnpm / yarn）即可。

| 命令             | 作用                                                           |
| :--------------- | :------------------------------------------------------------- |
| `pnpm install`   | 安装依赖                                                       |
| `pnpm dev`       | 启动本地开发服务器：`localhost:3000`                            |
| `pnpm build`     | 构建生产产物到 `./dist/`                                       |
| `pnpm postbuild` | 运行 Pagefind，生成博客文章的静态搜索索引                      |
| `pnpm preview`   | 在部署前本地预览构建结果                                       |
| `pnpm sync`      | 基于 `src/content/config.ts` 的配置生成类型                    |

<a id="configure"></a>
## 配置

- 编辑模板的配置文件 `src/site.config.ts`
  - **重要**：把 `url` 字段改成你自己的域名。
  - 调整由 [Expressive Code](https://expressive-code.com) 生成的 Markdown 代码块样式设置。Astro Cactus 内置了深色（dracula）与浅色（github-light）两套主题，更多选项可参考 [Expressive Code 主题列表](https://expressive-code.com/guides/themes/#available-themes)。
- 更新 `astro.config.ts`
  - 参考 [astro-webmanifest options](https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md)
- 替换并更新 `/public` 目录下的文件：
  - `icon.svg`：作为生成 favicon 与 manifest 图标的源文件
  - `social-card.png`：默认的 `og:image`
- 修改 `src/styles/global.css`，写入你自己的浅色/深色样式，并自定义 [Tailwind 主题配置](https://tailwindcss.com/docs/theme#customizing-your-theme)。
- 编辑 `src/components/SocialList.astro` 中的社交链接，添加/替换你的社交账号。图标可在 [icones.js.org](https://icones.js.org/) 查找，具体可参考 [Astro Icon 的使用说明](https://www.astroicon.dev/guides/customization/#find-an-icon-set)。
- 在 `src/content/post/` 与 `src/content/note/` 中创建/编辑博客文章与笔记（`.md` / `.mdx`）。更多说明见下方 [添加文章、笔记与标签](#adding-posts-notes-and-tags)。
  - 添加 Webmentions 可参考这篇文章：[Adding Webmentions](http://astro-cactus.chriswilliams.dev/posts/webmentions/)
  - 如需为某个标签页写自定义文案，在 `/src/content/tag/` 下添加同名文件（文件名需与标签名一致）。
- OG Image：
  - 如果你想调整 Satori 生成图片的样式，打开 `src/pages/og-image/[slug].png.ts`，在 `markup` 函数中修改 HTML/Tailwind class。也可以用这个在线工具辅助设计：[OG Playground](https://og-playground.vercel.app/)。
  - 你也可以在文章 frontmatter 里配置 `ogImage` 来使用自定义图片，从而跳过 Satori 自动生成。示例见 `src/content/post/social-image.md`；frontmatter 字段说明见下方 [文章 Frontmatter](#post-frontmatter)。
- 可选：
  - 字体：该主题在 `src/layouts/Base.astro` 的 `<body>` 上把字体设为 `font-mono`。你可以移除 `font-mono`，随后 Tailwind 会回退到默认的 `font-sans` [字体栈](https://tailwindcss.com/docs/font-family)。

<a id="updating"></a>
## 更新

如果你是从模板 fork 出来的，可以通过 GitHub 的 [sync the fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) 把上游更新同步到你的项目。注意 **不要** 点 “Discard Changes”，否则你的本地改动会丢失。

如果你的仓库是通过 “template repository” 创建的，可以把该模板添加为一个 remote，具体可参考：[Stack Overflow 讨论](https://stackoverflow.com/questions/56577184/github-pull-changes-from-a-template-repository)。

<a id="adding-posts-notes-and-tags"></a>
## 添加文章、笔记与标签

该主题使用 [Content Collections](https://docs.astro.build/en/guides/content-collections/) 来组织本地 Markdown/MDX 文件，并通过 `src/content.config.ts` 中的 schema 对 frontmatter 做类型校验。

添加文章/笔记/标签非常简单：把 `.md(x)` 文件放到 `src/content/post`、`src/content/note`、`src/content/tag` 之一即可。文件名会被用作 slug/url。

Tag 集合允许你覆盖自动生成的标签页内容。例如模板中的 `src/content/tag/test.md` 会覆盖 `your-domain.com/tags/test` 上显示的内容。

> **注意**
> 标签页要生效，文件名（`src/content/tag/*`）也必须出现在某篇文章的 `tags` frontmatter 中。（见 [文章 Frontmatter](#post-frontmatter)）

模板自带的 posts/notes/tags 主要用于演示 frontmatter 的写法与结构。另外，[Astro 文档](https://docs.astro.build/en/guides/markdown-content/) 也对 Markdown 页面有更详细的说明。

<a id="post-frontmatter"></a>
### 文章 Frontmatter

| 字段（\* 必填）        | 说明                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| title \*               | 顾名思义：用于文章链接文字、文章页的 H1，以及页面的 title。最大长度 60（在 `src/content/config.ts` 中限制）。                                                                                                                                                                                                 |
| description \*         | SEO 描述字段。长度在 50 到 160 之间（在 schema 中限制）。                                                                                                                                                                                                                                                     |
| publishDate \*         | 发布时间。若要修改日期格式/语言（当前为 **en-GB**），请调整 `src/site.config.ts` 中的日期选项。必要时也可以给 `<FormattedDate>` 组件传入额外参数。                                                                                                                                                             |
| updatedDate            | 可选：文章更新日期，格式同 `publishDate`。                                                                                                                                                                                                                                                                     |
| tags                   | 可选：文章标签。新标签会显示在 `your-domain.com/posts` 与 `your-domain.com/tags`，并生成 `your-domain.com/tags/[yourTag]` 等页面。                                                                                                                                                                             |
| coverImage             | 可选：文章顶部封面图对象。包含 `src`（图片路径）与 `alt`（图片说明）。示例见 `src/content/post/cover-image.md`。                                                                                                                                                                                                |
| ogImage                | 可选：自定义 OG Image。默认情况下每篇文章都会自动生成一张 OG 图；当你提供了 `ogImage` 时，会跳过自动生成并使用你给的图片。                                                                                                                                                                                     |
| draft                  | 可选：草稿标记，schema 默认是 `false`。设置为 `true` 后，文章会在生产构建中被过滤（包括 `getAllPosts()`、OG 图片、RSS、生成页面等）。示例见 `src/content/post/draft-post.md`。                                                                                                                                     |

<a id="note-frontmatter"></a>
### 笔记 Frontmatter

| 字段（\* 必填）        | 说明                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| title \*               | 用作笔记链接文字、页面 title，以及笔记页的 H1。最大长度 60。                                                           |
| description            | 可选：用于 head 中的 meta description。                                                                               |
| publishDate \*         | ISO 8601 格式（允许带时区偏移）。                                                                                     |

<a id="tag-frontmatter"></a>
### 标签 Frontmatter

| 字段（\* 必填）        | 说明                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| title                  | 可选：用于标签页 H1 与页面 title。最大长度 60。                                                         |
| description            | 可选：用于 head meta description，以及 H1 下方的第一段介绍文案。                                        |

<a id="frontmatter-snippets"></a>
### Frontmatter 代码片段

Astro Cactus 内置了一个 VS Code snippet，用于生成 posts/notes 的 frontmatter 模板，位置在 `.vscode/post.code-snippets`。在新建的 `.md(x)` 文件里输入 `frontmatter` 即可触发。VS Code 的 snippet 会在 IntelliSense 中出现：mac 用 (⌃Space)，Windows 用 (Ctrl+Space)。

<a id="pagefind-search"></a>
## Pagefind 搜索

该集成为博客文章与笔记提供静态搜索能力。当前形态下，Pagefind 只会在站点构建后生效。本主题额外提供了 `postbuild` 脚本，应在 Astro `build` 完成后运行。你可以通过依次运行 `build` 与 `postbuild` 在本地预览搜索效果。

搜索结果默认只包含 posts 与 notes 的页面。如果你希望包含其他/全部页面，把 `data-pagefind-body` 属性移除或挪动到更上层的容器上（当前它位于 `src/layouts/BlogPost.astro` 与 `src/components/note/Note.astro` 的文章区域）。

它也支持按文章 frontmatter 中的标签进行筛选。如果你不需要该能力，移除 `src/components/blog/Masthead.astro` 中链接上的 `data-pagefind-filter="tag"` 属性即可。

如果你不想集成 Pagefind：删除组件 `src/components/Search.astro`，并在 `package.json` 中卸载 `@pagefind/default-ui` 与 `pagefind`。同时也要把对应的 `postbuild` 脚本移除。

你可以通过懒加载 Web Components 的样式来降低初始 CSS 体积，示例可参考该讨论：[PR #145](https://github.com/chrismwilliams/astro-theme-cactus/pull/145#issue-1943779868)。

<a id="analytics"></a>
## 统计分析

你可能希望追踪博客/网站的访问量，从而了解趋势以及哪些文章/页面更受欢迎。可选的服务很多，包括一些托管平台自带的能力，比如 [Vercel Analytics](https://vercel.com/analytics)、[Netlify Analytics](https://www.netlify.com/products/analytics/) 和 [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)。

由于使用场景和偏好差异很大，这个主题/模板没有内置某一种固定的统计方案。

配置统计服务时，你通常需要在网站的 **HEAD** 中加入一段脚本。你可以在 `src/layouts/Base.astro` 的 head 中添加，或放到 `src/components/BaseHead.astro` 里。

<a id="deploy"></a>
## 部署

[Astro 部署文档](https://docs.astro.build/en/guides/deploy/) 对如何在不同平台部署 Astro 站点有非常完整的整理与说明。

默认情况下，站点会构建到 `/dist` 目录（见上方 [命令](#commands) 一节）。

<a id="acknowledgment"></a>
## 致谢

本主题灵感来自 [Hexo Theme Cactus](https://github.com/probberechts/hexo-theme-cactus)。

## 许可

MIT
