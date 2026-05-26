---
title: "翻出书架上的树莓派，和 Claude 一晚上把它玩起来"
description: "一台买回来装好就吃灰的 Pi Zero 2W + PiSugar 3 + 2.13 寸墨水屏，搬家翻出来，今晚和 AI 一起从零调通：事件驱动的状态显示 daemon、内核接入 RTC、GitHub 公钥同步、bootstrap 一键复盘。整套配置归档到 GitHub，下次 SD 卡挂了也能 git clone 出来。"
publishDate: "2026-05-09"
tags: ["raspberry-pi", "pisugar", "e-paper", "claude-code", "ai", "homelab"]
pinned: true
coverImage:
  alt: "Pi Zero 2W 墨水屏成品"
  src: "./cover.jpg"
---

## 起因

搬家整理书架，翻出一个粉紫色 3D 打印壳子，里面塞着 Pi Zero 2W + PiSugar 3 电池板 + Waveshare 2.13 寸墨水屏。

这套东西是早就装好了的——Pi Zero 2W、PiSugar 3 电池板、墨水屏都是即插即用模块，叠在一起塞进 3D 打印的外壳，调过电、跑过 demo——然后就堆在书架某个角落里。具体什么时候装的也想不起来了，反正过了挺久，期间它就这样静静躺着，搬家整理时才被翻出来。属于那种很 typical 的"装好之后没下文"——大概八成的硬件爱好者都熟悉这种感觉。

今晚在桌上看了一会儿，想着干脆和 Claude Code 一块儿把它玩起来吧——既然现在 AI 已经能干这种活了，我负责拍板，剩下挖代码、跑命令、解决奇怪环境问题的事就丢给它。

> Spoiler：成品长这样，IP / WiFi / 电量 / CPU / 内存 / 磁盘 / 充电状态全在一块小屏上，按按钮还有反馈。
>
> ![成品](https://github.com/zkl2333/home-pi/blob/main/.github/images/zero2w-eink.jpg?raw=true)

## 第一阶段：摸清家底

让 AI ssh 进去看了一圈，发现这台 Pi 的状态比我预期还干净——

- Raspbian 11 (bullseye)，内核 6.1.21
- `/home/pi` 下两个目录：Waveshare 官方 e-Paper SDK 解压包、PiSugar 的蓝牙配 WiFi 工具
- bash_history 里有几行：装过 PIL/numpy/spidev、跑过 `epd_2in13_V3_test.py`，然后就没了

也就是说当时我止步于"屏幕能亮"，连一行自己的代码都没写。

PiSugar 服务在跑，端口 8421/8422/8423 分别开着 HTTP/WebSocket/TCP，电量数据完整可读。墨水屏型号确认是 **2.13" V3**。

## 第二阶段：第一个目标

**「在屏幕上显示设备状态」**——简单具体可成。

主体没什么悬念：一个 Python 脚本，读 `hostname -I` 拿 IP、读 `/proc/...` 拿系统状态、TCP 连本地 PiSugar 拿电量，PIL 拼图，调 Waveshare lib 推屏幕。

第一版十分钟就跑起来了。然后开始一轮一轮的「这里能不能再...」：

1. **「转 180° 更好，加局刷」** → 改用 `displayPartial()`，刷屏从 8 秒掉到 0.7 秒
2. **「布局再优化，电量像手机状态栏放顶部」** → 上面加了状态栏：时间 / WiFi 信号格 + RSSI / 电池图标 + 百分比
3. **「load 是什么？加点中文标签和图标好懂点」** → 装 `fonts-wqy-microhei`，关键标签换中文，图标全用 PIL 自己画几何图形（温度计 / CPU / 内存条 / 圆盘 / 闪电 / WiFi / 电池），1 bit 像素风正好契合墨水屏
4. **「上面太空下面太密」** → 把电压脚注挪到 hostname 行右侧，主体均成 3 行均匀排版

每一轮我就是看屏幕、说一句话、AI 改 + 部署 + 给我看效果。中间没掉过链子，几乎是"所见即所得"。

## 第三阶段：把它做成事件驱动的

每 5 分钟全刷一次太傻——明明大部分时间都没变化，应该是「有事发生了」才刷。

PiSugar 的 TCP 协议能推 button event（single / double / long），刚好可以接进来当事件源。最后做成这个模型：

```
PiSugar 长连接监听 tap 事件
  └→ 立即局刷 + 屏幕右下角显示反馈 badge（"单击"/"双击"/"长按"）

10 秒一轮轻量轮询，仅当关键字段变了才触发刷新：
  - 当前分钟
  - IP 地址
  - 电量百分比（按 5% 一档去抖）
  - 充电 / 接电状态
其他字段（CPU 温度、负载、内存、磁盘、电压电流、信号强度）顺带更新但不触发刷新
```

按按钮的反馈很有体感，几乎是按下就响应（局刷 0.7 秒）。

## 第四阶段：生产化 + 可复盘

"调通也不容易"——硬件接好、配置打通、依赖装齐，是会被一次格 SD 卡毁掉的。所以从一开始就让 AI 同步把整套环境写进一个 GitHub 仓库：

**[github.com/zkl2333/home-pi](https://github.com/zkl2333/home-pi)**

核心是个 `bootstrap.sh`，幂等，新 Pi 上 `git clone` + `bash bootstrap.sh` 就能恢复到当前状态：

```
1. apt 装系统包（PIL / numpy / spidev / RPi.GPIO / 中文字体）
2. raspi-config 启 SPI / I2C
3. git clone Waveshare e-Paper SDK
4. 装 PiSugar power-manager 和 sugar-wifi-conf 蓝牙配 WiFi
5. /etc/pisugar-server/config.json 用 jq patch 开 RTC 双向同步
6. /boot/config.txt 加 dtoverlay=i2c-rtc,ds3231 让内核接管 RTC
7. 部署 ~/.ssh/sync-github-keys.sh + crontab（每小时从 GitHub API 拉公钥同步）
8. 把 projects/* 拷到 ~/projects/ 并跑各自的 install.sh
```

仓库里还顺手做了几件让未来的我感到欣慰的事：

- **SSH 公钥单一可信源** = GitHub。在 GitHub 上加/删公钥，Pi 会在 1 小时内自动跟上。这避免了"哪台老设备装过我的私钥"的心智负担。
- **APT 国内镜像（清华 TUNA）也写进 bootstrap**。Pi 在国内网络下从 `raspbian.raspberrypi.org` 拉东西巨慢，TUNA 13 秒拉完 13MB 包列表。
- **所有 shell / Python 文件用 `.gitattributes` 强制 LF 行尾**。Windows 上 git checkout 出来的 CRLF shell 脚本到 Pi 上会让 bash 报 `/usr/bin/env: 'bash\r': No such file or directory`，这种坑提前堵掉。
- **`CLAUDE.md` 单独写给后续 AI session 看**。包括踩过的坑、命令速记、当前 TODO。下次再让 AI 接着干，能立刻进入状态。

## 一些有意思的踩坑

**踩坑 1：用 paramiko exec_command 跑 daemon**

调试早期我用 Python 的 paramiko 库远程跑 `python3 daemon.py` 测试。问题是 daemon 不会自己退出，paramiko 客户端断开后这个 Python 进程被 init (PID 1) 收养，独占 SPI / GPIO / PiSugar 长连接，systemd 启的新 daemon 抢不到资源。

表现：屏幕看似在工作，但按按钮没反应、有时数据停止刷新。诊断了好一会儿才意识到是孤儿进程。修法是 daemon 全部交 systemd 管，部署只走"短命令"（tar 流式打包 + ssh 解开），不让任何长进程绑在 SSH 会话上。

**踩坑 2：PiSugar 官方 Python 库 0.1.1 不能用**

中途想用 [pisugar-server-py](https://github.com/PiSugar/pisugar-server-py) 替掉自己写的 socket 解析。结果发现两个 bug：

- 事件回调里 `event == b'single'` 严格匹配，但 PiSugar 推的是 `b'single\n'`——**永远不匹配**，事件回调一次都不会触发
- 命令通道 `recv(4096)` 单次读 + 字符串 replace 过滤事件行，TCP 分包就错位，连续报 `Expected b'battery' but got b'\n'`

库最后一次 commit 是 2022 年 6 月，停滞状态。我们查代码、提需求时发现根本没人 review。改回自己的 socket 实现，10 行不到就稳定可靠。

**踩坑 3：Pi 网络下 github.com 被屏蔽**

Pi 在我家 WiFi 下 ping github.com 是通的（20.205.x.x），但 HTTPS 443 直连超时。`https://github.com/<user>.keys` 这种端点完全访问不到。

兜底方案是 `https://api.github.com/users/<user>/keys`——api.github.com 走 Cloudflare CDN，IP 段不在被屏蔽列表里，800ms 拿到完整 JSON。SSH 公钥同步脚本就吃这个端点。

**踩坑 4：fake-hwclock 显示 8 小时前的时间**

升级 RTC 那一步发现一个问题：Pi OS 默认装了 `fake-hwclock`——这是个软件时钟模拟，关机时把当前时间写到磁盘文件，开机读出来。我看 `/etc/fake-hwclock.data` 时间停在 8 小时 48 分前，说明它根本没及时落盘。

PiSugar 3 自带 DS3231 RTC 芯片，正确做法是 `/boot/config.txt` 加 `dtoverlay=i2c-rtc,ds3231`，让 Linux 内核直接把 RTC 当 `/dev/rtc0` 用。重启后 dmesg 里这一行让人很安心：

```
[9.99] rtc-ds1307 1-0068: setting system clock to 2026-05-09T14:09:59 UTC
```

启动 9.99 秒、systemd-timesyncd 都还没启动，系统时钟就已经从 RTC 读到正确时间了。比 NTP 同步早不止一个数量级。

## 体感

最大的感受：AI 协作让我**敢做"边角项目"了**。

以前一个项目包含「研究新硬件协议」「写小语言版本的胶水代码」「调远程系统配置」「搭部署/恢复方案」「文档化」这几块，每一块都不难，但叠在一起就让人想拖。今晚和 AI 一起搞，每一块都是几分钟到十几分钟级别的事，节奏从来没有掉。

值得一提的几个交互模式：

1. **我描述目标，它给方案选项 + 推荐**。比如 SSH 公钥那块，它先列了 `ssh-copy-id` / 公钥仓库 / GitHub API 同步几种思路，给出"GitHub 是单一可信源最干净"的判断，然后实施。
2. **它会主动 surface 风险**。比如改 `/boot/config.txt` 之前会列出"如果 dtoverlay 加载失败会怎样、最坏情况怎么回滚"。改完它会主动说"已备份在 `/boot/config.txt.bak.<时间戳>`，远程 brick 风险低"。
3. **踩坑是合作的机会而不是阻塞**。每次发现问题，它会同时输出"这是什么 bug + 临时绕开 + 长期解决 + 写进 CLAUDE.md 提醒未来的自己"四件套。

也不是没有出问题——比如它有一次给我看 `gh repo list` 的 `updatedAt` 时间，说"PiSugar 那个库 5 周前还在更新"，我追问之下才发现 `updatedAt` 是 repo metadata 时间（star、fork 都算），实际最后 commit 是 2022 年。这种"用了模糊指标得出错误结论"是当下 AI 最容易出的错。我让它去查 commits API 直接看 commit history，错误立刻自我修正。

## 最后

写到这里墨水屏正稳稳挂在桌角，每分钟 0.7 秒局刷一次，带着小小的反馈感。今晚一共 4 个 commit + 11 个 commit + 文档 + 这篇博客 = 一整个晚上的产出，配置全在 git 里，下次 SD 卡坏掉照样 15 分钟复盘。

仓库：[github.com/zkl2333/home-pi](https://github.com/zkl2333/home-pi)

如果你也有类似"曾经心血来潮但是被搁置"的硬件或者开发板，那就翻出来吧，现在的 AI 能力已经能覆盖这种小项目了。
