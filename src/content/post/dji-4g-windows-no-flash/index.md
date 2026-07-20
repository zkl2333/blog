---
title: "不刷机，让大疆一代 4G 模块在 Windows 上收短信、连 4G"
description: "实测大疆一代百旺 QDC507 模块：不改 VID/PID、不刷固件，只为 MI_02 和 MI_04 手动绑定签名驱动，即可在 Windows 使用 AT 指令、收发短信和通过中国电信 4G 上网。"
category: "硬件折腾"
publishDate: "2026-07-20T15:40:00+08:00"
updatedDate: "2026-07-20T15:50:00+08:00"
tags: ["dji", "4g", "windows", "quectel", "at-command"]
---

最近群里不少小伙伴都在玩大疆一代 4G 模块，热度挺高。大家常见的玩法是把它接到 NAS 上，再用 Docker 跑 VoHive 管理短信和网络。看他们折腾得热闹，我也跟着买了一个。

早上收到快递，我直接把模块带到了公司。NAS 在家，Docker 方案只能等晚上回去再玩；眼前正好有一台 Windows 电脑，那就先插上去，看看原厂状态能不能直接跑起来。

设备管理器很快热闹起来：一个 USB 复合设备，下面挂着五个叫 `Baiwang` 的未知设备，整整齐齐五个黄色感叹号。

网上的教程大多从 Linux、OpenWrt 或 VoHive 开始，紧接着就是「改机」「改 ID」甚至「刷机」。我只想先确认一件事：**原厂状态能不能在 Windows 上收短信、上 4G？**

答案是可以。

这次实测没有刷固件，没有把 `2CA3:4006` 改成移远的 `2C7C:0125`，也没有发送任何修改 `usbcfg`、`usbid` 或 `usbnet` 的 AT 指令。做的事情只有两件：

1. 把 `MI_02` 手动绑定成 AT 串口；
2. 把 `MI_04` 手动绑定成 WWAN 蜂窝网卡。

最后的结果：

| 项目        | 实测结果                                |
| ----------- | --------------------------------------- |
| AT 串口     | 正常，Windows 枚举为 `COM3`             |
| 模块识别    | `Baiwang QDC507`                        |
| 固件        | `QDC507GLEFM21_01.001.02.001`           |
| SIM         | 正常识别                                |
| 短信        | PDU 收发正常，可区分模块存储与 SIM 存储 |
| 蜂窝网络    | Windows Mobile Broadband 正常识别       |
| 运营商      | 中国电信                                |
| IPv4 / IPv6 | 均正常获取                              |
| 外网测试    | 指定 4G 源地址访问测试页返回 HTTP 204   |

下面把完整过程记下来。

## 它其实是谁

模块的 USB ID 是：

```text
VID_2CA3&PID_4006
```

通过 `ATI` 和 `AT+QGMR` 查询，得到：

```text
Baiwang
QDC507
Revision: QDC507GLEFM21
```

它本质上是移远 EG25-G 系列方案，只是大疆/百旺使用了自己的 VID/PID。硬件和协议能力都在，Windows 不认识的只是这张「身份证」。

模块会枚举五个 USB 接口：

| 接口    | 常见用途          | 本文是否处理 |
| ------- | ----------------- | ------------ |
| `MI_00` | 诊断接口          | 否           |
| `MI_01` | NMEA/GNSS         | 否           |
| `MI_02` | AT 指令串口       | 是           |
| `MI_03` | Modem 辅助接口    | 否           |
| `MI_04` | QMI/WWAN 网络接口 | 是           |

在设备管理器里，它们的硬件 ID 类似：

```text
USB\VID_2CA3&PID_4006&MI_00
USB\VID_2CA3&PID_4006&MI_01
USB\VID_2CA3&PID_4006&MI_02
USB\VID_2CA3&PID_4006&MI_03
USB\VID_2CA3&PID_4006&MI_04
```

> [!NOTE]
> `MI_02` 不是型号，而是 USB 复合设备的第 2 号接口。Linux 下常见的 `/dev/ttyUSB2` 与它有关，但串口编号不是永远固定的，实际仍应以发送 `AT` 能否返回 `OK` 为准。

## 「不刷机」到底省略了什么

很多教程所说的「刷机」，其实只是通过 AT 指令把 USB ID 从：

```text
2CA3:4006  # DJI/Baiwang
```

永久改成：

```text
2C7C:0125  # Quectel
```

改完后 Linux 能自动加载 `option` 和 `qmi_wwan`，使用起来确实方便，但它会向模块写入持久配置。

本文完全不做这一步。代价是 Windows 不会自动匹配驱动，需要在设备管理器里手动指定。好处也很直接：模块保持原厂身份，整个过程可以通过卸载 Windows 设备驱动撤销。

真正替换 QDC507 基带固件的「刷固件」风险更高，可能涉及 NV、射频校准、IMEI 和 USB 功能布局。为了 AT、短信和 4G 上网，没有必要碰它。

## 准备签名驱动

需要两类驱动：

```text
qcser.inf   # 串口
qcwwan.inf  # WWAN 网卡
```

可以使用 Quectel LTE&5G Windows USB Driver，或系统中已有的 Microsoft WHCP 签名 Qualcomm 驱动。先检查驱动仓库：

```powershell
pnputil /enum-drivers |
  Select-String -Pattern 'qcser|qcwwan|Quectel|Qualcomm' -Context 3,5
```

重点看两项：

```text
Original Name: qcser.inf / qcwwan.inf
Published Name: oemXX.inf
```

`oemXX.inf` 的编号由每台 Windows 自己分配，不能照抄别人的 `oem107.inf`、`oem108.inf`。找到实际路径后检查签名：

```powershell
Get-AuthenticodeSignature 'C:\Windows\INF\oemXX.inf'
```

`Status` 应为 `Valid`。

> [!WARNING]
> 不要为了省一步去修改 INF 加入 `2CA3:4006`。一旦修改，原始目录文件的数字签名就失效了。也不要随便安装来源不明的所谓「魔改驱动」。

## 第一步：把 MI_02 装成 AT 串口

在设备管理器的「其他设备」中，逐个查看 `Baiwang`：

```text
右键 → 属性 → 详细信息 → 硬件 ID
```

找到：

```text
USB\VID_2CA3&PID_4006&MI_02
```

然后：

```text
更新驱动程序
→ 浏览我的电脑以查找驱动程序
→ 让我从计算机上的可用驱动程序列表中选取
→ 显示所有设备
→ 从磁盘安装
```

选择实际的 `qcser.inf`，型号选择：

```text
Qualcomm HS-USB AT Port 9003
```

如果用的是移远驱动包，名称可能是：

```text
Quectel USB AT Port
```

不要选 `Diagnostics`、`NMEA` 或 `QDLoader`。确认 Windows 的不匹配提示后，设备会出现在「端口（COM 和 LPT）」下。我的机器分配到了 `COM3`。

## 第二步：用 AT 指令验证

下面这段 PowerShell 只执行查询，不修改模块配置。将 `COM3` 换成设备管理器中的实际端口：

```powershell
$port = [System.IO.Ports.SerialPort]::new('COM3', 115200, 'None', 8, 'One')
$port.ReadTimeout = 2500
$port.WriteTimeout = 2000
$port.DtrEnable = $true
$port.RtsEnable = $true

try {
  $port.Open()
  Start-Sleep -Milliseconds 400

  foreach ($cmd in @(
    'AT',
    'ATI',
    'AT+QGMR',
    'AT+CPIN?',
    'AT+QCCID',
    'AT+CSQ',
    'AT+CEREG?',
    'AT+COPS?'
  )) {
    $port.DiscardInBuffer()
    $port.Write("$cmd`r")
    Start-Sleep -Milliseconds 900
    "--- $cmd ---"
    $port.ReadExisting()
  }
}
finally {
  if ($port.IsOpen) { $port.Close() }
  $port.Dispose()
}
```

正常结果：

```text
AT          → OK
AT+CPIN?    → +CPIN: READY
AT+CEREG?   → 0,1 或 0,5
AT+COPS?    → 当前运营商
```

有个容易误判的地方：LTE 注册主要看 `CEREG`。本次测试里 `CEREG: 0,1` 已经注册成功，但传统电路域的 `CREG` 仍可能显示未注册或被拒绝，不影响 LTE 数据业务。

SIM 没插好时常见：

```text
+CME ERROR: 10  # 未检测到 SIM
+CME ERROR: 13  # SIM 失败
```

断开 USB 电源，重新安装 Nano-SIM，再上电即可。不要带电反复插拔 SIM。

## 顺手验证短信

短信存储有两个容易混淆的名字：

| 名称 | 含义                            |
| ---- | ------------------------------- |
| `ME` | 模块内部存储，换 SIM 后仍然保留 |
| `SM` | 当前 SIM 卡存储                 |

查询当前存储：

```text
AT+CPMS?
```

例如：

```text
+CPMS: "ME",8,23,"ME",8,23,"ME",8,23
```

这表示模块内部有 8 个短信分片，不代表当前 SIM 卡中有 8 条短信。切到 SIM 卡查询数量，再恢复模块存储：

```text
AT+CPMS="SM","SM","SM"
AT+CPMS?
AT+CPMS="ME","ME","ME"
```

常见只读短信命令：

```text
AT+CMGF?   # 查询短信模式
AT+CNMI?   # 查询新短信通知
AT+CSCA?   # 查询短信中心
AT+CMGL=4  # 列出当前存储中的全部短信
AT+CMGR=0  # 读取指定序号
```

QDC507 默认通常使用 PDU 模式。中文长短信会拆成多个分片，需要按 UDH 的引用号、总片数和序号重组，再用 UCS-2 解码。

> [!DANGER]
> `AT+CMGD` 是删除短信。只想查看时不要执行 `AT+CMGD=<序号>`，更不要执行删除全部短信的命令。

## 第三步：把 MI_04 装成 WWAN 网卡

回到设备管理器，找到：

```text
USB\VID_2CA3&PID_4006&MI_04
```

重复「从磁盘安装」，这次选择实际的 `qcwwan.inf`。

优先选择：

```text
Qualcomm HS-USB WWAN Adapter 9003
```

有些驱动列表不显示带 `9003` 的名称，可以选择使用同一 `qcwwan.ndi` 安装段的通用项：

```text
Qualcomm HS-USB WWAN Adapter
```

Quectel 驱动包中可能显示：

```text
Quectel Wireless Ethernet Adapter
```

不要选带 `MUX`、`MI_03`、`Diagnostics` 或 `NMEA` 的项。

安装完成后检查：

```powershell
Get-PnpDevice -PresentOnly |
  Where-Object InstanceId -match 'VID_2CA3&PID_4006&MI_04'

Get-NetAdapter -IncludeHidden |
  Where-Object InterfaceDescription -match 'Qualcomm|Quectel|WWAN'

netsh mbn show interfaces
```

Windows 应该能识别出 Mobile Broadband 接口、模块型号、固件、运营商和信号。

## 第四步：配置 APN

三大运营商常用 APN：

| 运营商   | 常用 APN            |
| -------- | ------------------- |
| 中国移动 | `cmnet`             |
| 中国联通 | `3gnet` 或 `uninet` |
| 中国电信 | `ctnet`             |

物联网卡、企业卡、定向流量卡应使用服务商给出的专用 APN，不要猜。

部分 Windows 可以在这里添加：

```text
设置 → 网络和 Internet → 手机网络 → APN 设置
```

但我的 Windows 版本根本没有显示「移动运营商设置」。这时可以直接用 `netsh mbn`。

先查询接口和当前 SIM 信息：

```powershell
netsh mbn show interfaces
netsh mbn show readyinfo interface="手机网络"
```

输出中的 Subscriber ID 和 SIM ICC ID 属于敏感标识，不要截图公开。创建 `ctnet.xml`，将占位内容替换为当前 SIM 的实际值：

```xml
<?xml version="1.0" encoding="utf-8"?>
<MBNProfile xmlns="http://www.microsoft.com/networking/WWAN/profile/v1">
  <Name>China Telecom ctnet</Name>
  <IsDefault>true</IsDefault>
  <ProfileCreationType>UserProvisioned</ProfileCreationType>
  <SubscriberID>替换为 Subscriber Id</SubscriberID>
  <SimIccID>替换为 SIM ICC Id</SimIccID>
  <HomeProviderName>China Telecom</HomeProviderName>
  <AutoConnectOnInternet>true</AutoConnectOnInternet>
  <ConnectionMode>auto</ConnectionMode>
  <Context>
    <AccessString>ctnet</AccessString>
    <Compression>DISABLE</Compression>
    <AuthProtocol>NONE</AuthProtocol>
  </Context>
</MBNProfile>
```

导入并连接：

```powershell
netsh mbn add profile interface="手机网络" name="D:\路径\ctnet.xml"
netsh mbn show profiles interface="手机网络"
netsh mbn connect interface="手机网络" connmode=name name="China Telecom ctnet"
```

本次连接时，`netsh` 首先返回了 `0x139f`，看起来像失败；但几秒后接口已经进入 `Connected`。所以不要只看第一行错误码，应该检查实际状态：

```powershell
Start-Sleep -Seconds 8
netsh mbn show interfaces
Get-NetIPConfiguration -InterfaceAlias '手机网络'
```

如果已经获得运营商地址、默认网关和 DNS，就说明数据会话已建立。

## 验证流量确实走 4G

电脑同时连接 Wi-Fi 或有线网络时，直接访问网页未必走 4G。可以绑定蜂窝接口的 IPv4 地址进行测试：

```powershell
$src = Get-NetIPAddress -InterfaceAlias '手机网络' -AddressFamily IPv4 |
  Where-Object IPAddress -notlike '169.254.*' |
  Select-Object -First 1 -ExpandProperty IPAddress

ping.exe -n 3 -S $src 1.1.1.1

curl.exe --interface $src `
  -o NUL `
  -w "HTTP=%{http_code} CONNECT=%{time_connect}s TOTAL=%{time_total}s`n" `
  http://connectivitycheck.gstatic.com/generate_204
```

本次实测：

```text
1.1.1.1：3/3 成功
HTTP：204
连接耗时：约 70ms
```

说明蜂窝接口本身已经可以正常访问互联网。

断开和重连：

```powershell
netsh mbn disconnect interface="手机网络"

netsh mbn connect `
  interface="手机网络" `
  connmode=name `
  name="China Telecom ctnet"
```

## 换卡后需要做什么

同一运营商换卡时，APN 通常不变；换运营商时一般要换 APN。但 Windows MBN 配置还包含 Subscriber ID 和 SIM ICC ID，因此即使同运营商换卡，旧配置也可能不再匹配。

换卡后：

```powershell
netsh mbn show readyinfo interface="手机网络"
netsh mbn show profiles interface="手机网络"
```

删除旧配置：

```powershell
netsh mbn delete profile `
  interface="手机网络" `
  name="China Telecom ctnet"
```

再用新卡的 Subscriber ID、SIM ICC ID 和正确 APN 重新生成配置。

## 为什么做不到真正的插上即用

实验已经证明，驱动本身完全能工作，缺的只有硬件 ID 匹配：

```text
模块：2CA3:4006
通用驱动声明的设备：05C6:* / 2C7C:0125 等
```

想让 Windows 真正自动安装，只有两条路：

1. 把模块 ID 改成通用驱动认识的 `2C7C:0125`；
2. 做一份包含 `2CA3:4006` 且由可信厂商或微软签名的驱动。

第一条会写模块配置，不符合本文目标；第二条不是改两行 INF 就行，修改后原签名会失效。

不过可以做一个管理员运行的一键工具，用 Windows SetupAPI 自动完成 `MI_02`、`MI_04` 的驱动选择，再按 SIM 运营商生成 APN。它仍然是在 Windows 中安装驱动，但用户不必再进设备管理器逐项点击，而且完全不用刷模块。

## 收尾

这次最有价值的结论不是「QDC507 能上网」——Linux 社区早就证明了。真正补上的拼图是：**大疆私有 VID/PID 并不妨碍原厂固件在 Windows 下完成 AT、短信和 WWAN 数据业务；它只妨碍自动匹配驱动。**

我原本买它，就是打算晚上带回家接 NAS、跑 Docker。这趟公司里的 Windows 测试算是开箱后的前菜，却顺手验证了一条更轻的路：如果目标只是把模块临时用作短信终端或备用 4G 网卡，先别刷，两次手动绑定驱动已经足够。

## 参考资料

- [大疆 4G 模块用于 PC 上网看我这篇就够了](https://www.bilibili.com/opus/671161658793525268)
- [DJI 4G Dongle Toolkit](https://github.com/maomomo-eth/dji-4g-dongle)
- [VoHive](https://github.com/giszh86/vohive)
- [Quectel EG25-G](https://www.quectel.com/product/lte-eg25-g/)
