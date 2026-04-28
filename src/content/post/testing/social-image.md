---
title: "OG 社交分享图示例"
publishDate: "27 January 2023"
description: "以 Astro Cactus 为例，介绍如何在 frontmatter 中为单篇文章配置自定义社交分享图（OG image）"
tags: ["example", "blog", "image"]
ogImage: "/social-card.png"
---

## 为文章添加自定义社交分享图

这篇文章演示如何为博客文章添加自定义的 [Open Graph](https://ogp.me/) 社交分享图（也叫 OG image）。
在文章 frontmatter 中添加可选的 `ogImage` 字段后，你就等于选择不使用 [satori](https://github.com/vercel/satori) 为该页面自动生成图片。

打开这个 Markdown 文件 `src/content/post/social-image.md`，你会看到 `ogImage` 指向了一张放在 `public` 目录里的图片[^1]。

```yaml
ogImage: "/social-card.png"
```

你可以在这里查看模板默认使用的那张图片：[social-card.png](https://astro-cactus.chriswilliams.dev/social-card.png)。

[^1]: 图片文件本身可以放在你喜欢的任何位置。
