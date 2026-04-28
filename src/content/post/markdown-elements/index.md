---
title: "Markdown 元素示例"
description: "用于测试并列举多种 Markdown 语法元素的示例文章"
publishDate: "22 Feb 2023"
updatedDate: 22 Jan 2024
tags: ["test", "markdown"]
pinned: true
draft: true
---

## 这是一个二级标题（H2）

### 这是一个三级标题（H3）

#### 这是一个四级标题（H4）

##### 这是一个五级标题（H5）

###### 这是一个六级标题（H6）

## 分割线（Horizontal Rules）

---

---

---

## 强调（Emphasis）

**这是加粗文本**

_这是斜体文本_

~~删除线~~

## 引号（Quotes）

“双引号” 和 ‘单引号’

## 引用块（Blockquotes）

> 引用块也可以嵌套……
>
> > ……只要连续使用更多的 `>` 符号即可。

## 脚注引用（References）

示例：包含一个可点击的脚注引用[^1]，并带有回到正文的链接。

第二个示例：另一个脚注引用[^2]，同样带有链接。

[^1]: 第一个脚注，包含返回正文的链接。

[^2]: 第二个脚注。

如果你查看 `src/content/post/markdown-elements/index.md` 这个示例，会发现脚注及“Footnotes”标题是通过 [remark-rehype](https://github.com/remarkjs/remark-rehype#options) 插件自动追加到页面底部的。

## 列表（Lists）

无序列表

- 通过以 `+`、`-` 或 `*` 开头来创建列表项
- 通过以 `+`、`-` 或 `*` 开头来创建列表项
- 子列表通过缩进 2 个空格创建：
  - 改变标记字符会强制开启一个新列表：
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
- 就这么简单！

有序列表

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

4. 你可以用递增数字……
5. ……也可以全部写成 `1.`（渲染时依然会自动编号）

从指定序号开始：

57. foo
1. bar

## 代码（Code）

行内代码：`code`

缩进代码

    // 一些注释
    代码第 1 行
    代码第 2 行
    代码第 3 行

围栏代码块（fences）

```
这里是一段示例文本……
```

语法高亮

```js
var foo = function (bar) {
	return bar++;
};

console.log(foo(5));
```

### Expressive Code 示例

添加标题

```js title="file.js"
console.log("标题示例");
```

模拟 bash 终端

```bash
echo "一个基础终端示例"
```

高亮/标注代码行

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
	console.log("这一行被标记为删除");
	// 这一行和下一行被标记为插入
	console.log("这是第二行插入的内容");

	return "这一行使用中性（默认）标记类型";
}
```

[Expressive Code](https://expressive-code.com/) 的能力远不止这些，还支持大量[自定义配置](https://expressive-code.com/reference/configuration/)。

## 表格（Tables）

| 选项   | 说明                                   |
| ------ | -------------------------------------- |
| data   | 数据文件路径：提供将被传入模板的数据。 |
| engine | 模板处理引擎。默认使用 Handlebars。    |
| ext    | 目标文件的扩展名。                     |

### 表格对齐（Table Alignment）

| 商品         | 价格 | 库存数量 |
| ------------ | :--: | -------: |
| Juicy Apples | 1.99 |      739 |
| Bananas      | 1.89 |        6 |

### 键盘按键（Keyboard elements）

| 操作           | 快捷键                                     |
| -------------- | ------------------------------------------ |
| 垂直分屏       | <kbd>Alt+Shift++</kbd>                     |
| 水平分屏       | <kbd>Alt+Shift+-</kbd>                     |
| 自动分屏       | <kbd>Alt+Shift+d</kbd>                     |
| 在分屏间切换   | <kbd>Alt</kbd> + 方向键                    |
| 调整分屏尺寸   | <kbd>Alt+Shift</kbd> + 方向键              |
| 关闭分屏       | <kbd>Ctrl+Shift+W</kbd>                    |
| 最大化当前面板 | <kbd>Ctrl+Shift+P</kbd> + Toggle pane zoom |

## 图片（Images）

同目录图片：`src/content/post/markdown-elements/logo.png`

![Astro theme cactus logo](./logo.png)

## 链接（Links）

[Content from markdown-it](https://markdown-it.github.io/)
