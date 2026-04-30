# 配置指南

## 站点基础配置

### 1. 编辑 `src/site.config.ts`

这是最重要的配置文件，包含了站点的基本信息：

```typescript
// 必须修改
url: "https://your-domain.com"; // 你的域名
title: "Your Site Title"; // 站点标题
description: "Your description"; // 站点描述
author: "Your Name"; // 作者名称
```

### 2. Markdown 代码块样式

在 `src/site.config.ts` 中配置 Expressive Code 主题：

```typescript
export const codeConfig = {
	themes: ["dracula", "github-light"], // 深色和浅色主题
};
```

可选的主题列表：[Expressive Code 主题](https://expressive-code.com/guides/themes/#available-themes)

## 品牌和外观

### 替换 Logo 和图片

1. **网站图标 (`/public/icon.svg`)**
   - 用于生成 favicon 和 manifest 图标的源文件

2. **社交分享卡 (`/public/social-card.png`)**
   - 默认的 `og:image`，用于链接分享预览

### 自定义样式

编辑 `src/styles/global.css`：

```css
/* 深色模式变量 */
:root.dark {
	--color-primary: #your-color;
	/* ... 更多变量 */
}

/* 浅色模式变量 */
:root {
	--color-primary: #your-color;
	/* ... 更多变量 */
}
```

也可以自定义 Tailwind 主题配置，详见 [Tailwind 文档](https://tailwindcss.com/docs/theme#customizing-your-theme)。

### 社交链接配置

编辑 `src/components/SocialList.astro` 添加或修改你的社交账号：

```astro
<Icon name="mdi:github" />
<!-- GitHub -->
<Icon name="mdi:twitter" />
<!-- Twitter -->
<Icon name="mdi:linkedin" />
<!-- LinkedIn -->
<!-- 更多图标在 icones.js.org 查找 -->
```

图标集：[icones.js.org](https://icones.js.org/)

## OG 图片配置

### 自动生成 OG 图片

默认情况下，每篇文章都会自动生成一张 OG 图片用于社交分享。

编辑 `src/pages/og-image/[slug].png.ts` 中的 `markup` 函数自定义样式：

```typescript
const markup = `
  <div style="background: linear-gradient(...)">
    <h1>${title}</h1>
  </div>
`;
```

设计工具：[OG Playground](https://og-playground.vercel.app/)

### 使用自定义 OG 图片

在文章 frontmatter 中指定 `ogImage`：

```yaml
---
title: "My Post"
ogImage: "/custom-og-image.png"
---
```

示例见 `src/content/post/social-image.md`

## Astro 配置

编辑 `astro.config.ts` 调整：

- Astro 集成选项
- 构建输出目录
- 其他 Astro 特定设置

参考：[astro-webmanifest options](https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md)

## 字体配置

默认使用等宽字体 (`font-mono`)：

- **保持**：保留当前配置（推荐）
- **改为 sans-serif**：编辑 `src/layouts/Base.astro`，移除 `font-mono` class，使用系统默认 sans-serif

## 高级配置

### Webmentions 评论

添加 Webmentions 支持，参考文章：
[Adding Webmentions](http://astro-cactus.chriswilliams.dev/posts/webmentions/)

### 自定义标签页面

为特定标签创建自定义说明页面，在 `/src/content/tag/` 下添加同名文件：

```
src/content/tag/
├── javascript.md    # 对应 #javascript 标签
├── react.md         # 对应 #react 标签
└── ...
```

**注意**：文件名必须与标签名一致，且标签必须在某篇文章的 `tags` 中使用过。

## 部署前检查清单

- [ ] 更新 `src/site.config.ts` 的 URL
- [ ] 替换 `/public/icon.svg`
- [ ] 替换 `/public/social-card.png`
- [ ] 配置社交链接
- [ ] 自定义样式（可选）
- [ ] 设置 Webmentions（可选）

下一步：[开始写作](../03-writing-guide/)
