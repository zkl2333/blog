# 配图

## 封面图自动 fallback（仓库已支持）

本博客仓库的 `src/data/post.ts` 实现了 `getEffectiveCover(post)`，规则：

1. frontmatter 有 `coverImage` → 用它（显式优先）
2. 没设 → 正则扫 `post.body` 第一张 `![alt](src)`
   - **本地相对路径**（`./xxx.png` / `xxx.png`）→ `import.meta.glob` 解析成 ImageMetadata，被 `<Image>` 全量优化（webp + srcset）
   - **远程 URL**（`https://...`）→ 字符串透传，用 `<img>` 直出
3. body 没图 → 不显示 cover

**所以写新文章时**：

- **想用同一张图既当封面又当正文图** → 不写 frontmatter `coverImage`，直接在正文放 `![](./xxx.png)`，让 fallback 自动接管
- **封面跟正文图不同 / 不想正文有图** → 写 frontmatter `coverImage`，正文不放重复图

## 常见模式

### 模式 1：纯本地图，无需重复展示

```yaml
---
title: "..."
# 没写 coverImage
---

![成品](./hero.png)

## 起因

...
```

→ Masthead 自动放 hero.png 作 cover（webp 优化），正文里那张内联图也保留。但 Masthead 在标题正下方就出现了，正文第一张内联图紧接着——视觉重复。

**所以这个模式只适合**：内联图不是放在正文最开头，而是放在文章中段（如某个章节的视觉引入）。这时候 cover 出现在顶部，中段那张是该章节的图，两处不打架。

### 模式 2：显式 cover + 不在正文重复

```yaml
---
coverImage:
  alt: "..."
  src: "./cover.png"
---

## 起因
...（正文里不再放 ./cover.png）
```

→ cover 只在顶部和列表卡片出现。**最干净的方案**，没有视觉冗余。这是 `eink-render-jsx` 实际用的方式。

### 模式 3：cover 用一张，正文中段用另外的图

```yaml
---
coverImage:
  alt: "设备照"
  src: "./device.jpg"
---

## 章节
...
![操作截图](./screenshot.png)
```

→ cover 是 hero 视觉，正文图是实际过程。`home-pi-revival` 是这个模式（cover 是设备实物，正文里又贴了 GitHub 上的同个设备的不同照片）。

## 自己生成配图

如果博客主题是某个**渲染 / UI / 可视化**项目，可以用项目代码自身生成 hero 图——这比 stock 图酷得多。

### 示例：用项目 PIL 输出拼图

```python
"""一次性脚本：把项目输出的 6 张 PNG 拼成 2x3 网格。"""
from PIL import Image, ImageDraw
from pathlib import Path

SRC = Path('...')                # 源 PNG 目录
OUT = Path(__file__).parent / 'pages-grid.png'

SCALE = 3                        # nearest-neighbor 放大（像素风格保留）
GAP = 32
PAD = 40

# ... 拼图逻辑

canvas.save(OUT, optimize=True)
```

**约定**：

- 临时脚本写在博客文章目录下（`src/content/post/<slug>/make-grid.py`），生成完**立刻 `rm` 删掉**
- 不要把生成脚本入 git——产物本身是 git 跟踪的
- 用 `py "path/to/script.py"`（Windows）/ `python` 跑，确认本地有 PIL（`py -c "from PIL import Image; print(Image.__version__)"`）

### 设计原则（针对像素 / 截图类配图）

- **白底 / 浅色背景**——不要黑底（除非内容本身是深色），博客是浅色主题
- **薄灰边框**模拟"屏幕物理边缘"——比黑边突兀小很多
- **足够的间距**（gap 24-32px，padding 32-40px）—— 呼吸感
- **不加标签条**——内容自己说话；如果非要加，放图片下方而不是上方
- **像素风格用 `Image.NEAREST` 放大**——不要用 `BILINEAR` 让像素糊掉

## 对比 / 迭代图（before-after、调参演进）

写"我把 X 从 A 调成 B"这类文章常配对比图。两条本会话踩出来的铁律：

1. **锁死除被比维度外的所有变量**。对比图只让"在讲的那一点"变，其它全钉死。本会话踩过：before/after 两张时钟图显示的时间不一样（一张 20:18 一张 20:06，因为各自实时渲染），读者注意力被噪声带跑。做法：渲染时传固定参数（时间、数据、状态都钉成同一组），只让被对比的算法/样式变。
2. **先后发生的步骤，拆成多张单态图、各归各的叙事节点；别塞一张多格大图**。本会话踩过：把"①竖直歪 → ②竖直正左右还歪 → ③都正"做成一张三连图，显得像一次同时调好的，违背真实时序；用户明确打回"不要三个放一起"。正确做法：竖直那步的 before/after 放讲竖直的那段，左右那步的 before/after 放讲左右的那段，中间隔着的探索照常叙述——图的分布本身就在讲"这是分几步、隔多久走到的"。
3. 复现"修复前"的坏状态：用 git 临时回退 / 临时改一处再渲一次截图，**渲完立刻 `git checkout` 还原**，不要把临时改动留在生产代码里（本会话用"临时改 raster + git checkout"复现了修复前的歪，可参考）。
4. 细微差异（差几像素那种）别为了戏剧化造假放大——加条参考线（十字 / 中线）让读者自己看出来，配文老实承认"就差这么点"，这种克制反而更贴用户调子。

## 远程图片（GitHub raw / CDN）

如果图托管在远程（GitHub raw、jsdelivr 等），可以直接在 markdown 里 `![](https://...)`：

```md
![成品](https://github.com/<user>/<repo>/blob/main/.github/images/hero.jpg?raw=true)
```

注意：

- 自动 fallback 会把它当成 remote URL，用 `<img>` 渲染（绕开 `image.domains` 白名单）
- 如果你想让远程图也走 Astro 优化，需要在 `astro.config.ts` 的 `image.domains` 加白名单
- 远程图依赖外部服务可用性，本地图更稳

## OG 图

OG 图（社交分享卡片）是另一回事，**通常不需要管**：

- `src/pages/og-image/[slug].png.ts` 用 satori 自动生成
- 用文章 title + publishDate 渲染
- 例外：如果你想显式指定，在 frontmatter 加 `ogImage: "/some/url.png"`

## 决策树

```
要不要加封面图？
├── 不要 → 啥都别写
└── 要 → 用什么图？
    ├── 现成有图（设备照、截图）→ 模式 2 或 3
    ├── 项目能自己渲染（UI / 可视化）→ 写一次性脚本生成 → 模式 2
    └── 同一张图既当封面又当正文图（中段用）→ 模式 1
```

## 反模式

1. ❌ 同一张图作 cover 又作正文第一张内联图（**视觉重复**）
2. ❌ cover 跟正文主题无关（"用一张漂亮的 stock 图当封面"——不够"自己"）
3. ❌ 在 git 里 commit 一次性生成脚本（产物入 git 就好）
4. ❌ 用 `BILINEAR` 放大像素图（糊）
5. ❌ 加深色/突兀的标签条（喧宾夺主）
