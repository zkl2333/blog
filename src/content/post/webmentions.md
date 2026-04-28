---
title: "为 Astro Cactus 添加 Webmentions"
description: "本文介绍如何为你自己的网站接入 Webmentions"
publishDate: "11 Oct 2023"
tags: ["webmentions", "astro", "social"]
updatedDate: 6 December 2024
pinned: true
---

## TLDR（太长不看）

1. 按照 [IndieLogin](https://indielogin.com/setup) 的说明，在首页添加指向你的 GitHub 主页和/或邮箱地址的链接。你可以通过 `src/components/SocialList.astro` 来做，只要记得给对应链接加上 `isWebmention`。
2. 打开 [Webmention.io](https://webmention.io/)，使用你的网站地址创建账号。
3. 将 feed 链接与 API key 写入 `.env`：分别使用 `WEBMENTION_URL` 与 `WEBMENTION_API_KEY`。你可以把模板里的 `.env.example` 重命名为 `.env`。也可以把可选的 `WEBMENTION_PINGBACK` 一并加上。
4. 打开 [brid.gy](https://brid.gy/) 并登录你想要关联的每个社交账号。
5. 发布并构建你的网站，记得在托管平台上配置 API key；完成后你的网站就可以接收 webmentions 了。

## 什么是 Webmentions

简单说，它是一种把社交平台上的互动（点赞、评论、转发等）“带回”你的网站页面的方式，让读者能在文章底部看到这些互动。

这个主题会展示每篇文章收到的点赞数、提及（mentions）以及回复（replies）。还有一些类型我没做展示，比如转发（reposts）目前被过滤掉了，但要加上也不会太难。

## 如何接入到你的网站

为了跑起来，你需要注册几个账号。不过第一步是先确保你站点里的社交链接是正确的。

### 在站点上添加你的身份链接

首先，你需要在站点里加一个链接来证明域名归属。按照 [IndieLogin](https://indielogin.com/setup) 的说明，有两种常见方式：邮箱地址和/或 GitHub 账号。我在组件 `src/components/SocialList.astro` 里预留了 `socialLinks` 数组供你填信息；只要给对应链接加上 `isWebmention`，它就会自动加上 `rel="me authn"` 属性。无论你用哪种方式，请确保你的页面里确实存在符合 IndieLogin [要求](https://indielogin.com/setup) 的链接。

```html
<a href="https://github.com/your-username" rel="me">GitHub</a>
```

### 注册 Webmention.io

接下来打开 [Webmention.io](https://webmention.io/)，使用你的域名登录创建账号，例如 `https://astro-cactus.chriswilliams.dev/`。注意：`.app` 顶级域名可能无法正常工作。登录后它会给你一些用于接收 webmentions 的链接。把这些信息记下来，然后创建 `.env` 文件（模板提供了 `.env.example`，你可以直接重命名）。将 feed 链接与 API key 分别写到 `WEBMENTION_URL` 和 `WEBMENTION_API_KEY`，如果需要也可以加上可选的 `WEBMENTION_PINGBACK`。尽量不要把这些敏感信息提交到仓库里。

:::note
你不一定要配置 pingback。也许只是巧合，但我当时加上之后，邮箱垃圾邮件明显变多了，内容大多是“你的网站还可以更好”。说实话它们也不算完全错。我后来把它去掉了，不过是否开启取决于你自己。
:::

### 注册 Brid.gy

接下来需要用到 [brid.gy](https://brid.gy/) 。顾名思义，它会把你的网站与社交媒体账号“桥接”起来。对于你要接入的每个账号（例如 Mastodon），点击对应按钮进行连接，让 brid.gy 能够抓取这些账号里指向你网站的互动。同样再提醒一次：brid.gy 目前对 `.app` 域名可能也有问题。

## 测试是否正常工作

都配置好后，就可以构建并发布你的网站了。**记得**在托管平台里配置环境变量 `WEBMENTION_API_KEY` 与 `WEBMENTION_URL`。

你可以通过 [webmentions.rocks](https://webmention.rocks/receive/1) 发送一条测试 webmention 来确认是否工作正常。用你的域名登录，输入授权码，然后填写你要测试的页面 URL。比如要测试本文，我会填写 `https://astro-cactus.chriswilliams.dev/posts/webmentions/`。要在站点上看到结果，重新构建或在本地重启开发模式，然后在页面底部就能看到新增的互动记录。

你也可以通过它们的 [API](https://github.com/aaronpk/webmention.io#api) 在浏览器里查看测试记录。

## 可能的改进与注意事项

- 目前新的 webmentions 只会在重新构建或重启开发模式时拉取。这意味着如果你不常更新站点，就很难及时看到新互动。可以很容易加一个定时任务（cron）去执行 `src/utils/webmentions.ts` 里的 `getAndCacheWebmentions()`，让网站定期拉取并缓存新内容。我下一步大概率会把它做成一个 GitHub Action。

- 我见过一些 mention 出现重复。由于它们的 id 不同，过滤起来会比较麻烦。

- 我不太喜欢用小小的“外链”图标去链接评论/回复。在移动端上因为尺寸原因体验不太好，后面可能会改掉。

## 致谢

非常感谢 [Kieran McGuire](https://github.com/chrismwilliams/astro-theme-cactus/issues/107#issue-1863931105) 的分享以及相关内容。我此前从没接触过 webmentions，希望这次更新能让更多人用起来。另外，[kld](https://kld.dev/adding-webmentions/) 和 [ryanmulligan.dev](https://ryanmulligan.dev/blog/) 的文章与示例对我完成接入帮助很大；如果你想进一步了解，这两篇也很值得参考。
