---
title: "好耶~又复活一个吃灰小屏幕"
description: "抽屉里又翻出一块吃灰的墨水屏，这次是 ESP32 的云模块，换 ESPHome 玩，接进 Home Assistant 显示天气。前后两个晚上，中间一串坑（代理、欠压回滚、工具链下坏）基本是 Claude 自己 SSH 进服务器趟掉的，我动动嘴就完事。这篇博客也是 AI 写的。"
category: "墨水屏"
publishDate: "2026-05-22"
tags: ["e-paper", "esp32", "esphome", "home-assistant", "claude-code", "ai", "homelab"]
coverImage:
  alt: "墨水屏云模块摆在键盘上，显示云图标、21°C、阴和日期湿度电压"
  src: "./cover.jpg"
---

## 起因

之前我们折腾了树莓派+墨水屏，但是树莓派配合 PiSugar 说实话续航也就两三个小时，因为那本质上是个 UPS。桌上一堆线插来插去的也很麻烦。但是没关系，我忽然联想到我还有一块吃灰的板子！那就是 Waveshare 的 2.13 寸墨水屏云模块。买回来大概也就跑过一下出厂 demo，然后吃灰至今。这次把它玩起来感受一下低功耗吧~

跟上一个树莓派墨水屏项目比，屏幕是同一种：2.13 寸、250×122、黑白。不一样的是背后：上次是一整台树莓派跑 Linux，这次屏、电池、充电全焊在一块板上，大脑是一颗 ESP32 单片机。

上次我研究了所谓的前端渲染墨水屏。这次就换个口味，玩一玩 ESPHome。也算是久仰大名但是还没实操过。ESPHome 是另一套思路：不写代码，而是写一份 YAML 配置。我觉得树莓派项目之后的方向可以参考这个模式，这次先体验一下成熟方案吧。

这一次的目标是：屏上显示天气，接入 Home Assistant，并且长续航。

第一夜是 5 月 18 号凌晨，我照着 Claude 说的一步步弄：装 ESPHome（因为我的 HA 是 Docker 部署的，不能装插件，只能独立部署 ESPHome）、跑第一次编译、USB 首刷。凌晨 01:42 编译成功，光编译本身就花了 349 秒。屏幕亮起来的第一下是一串乱码，但确实亮了。接上 Home Assistant 之后，天气、温度、湿度都上来了。

然后卡住了，卡在哪后面说。那一夜弄到三点多，屏上能显示个大概，但还没法看，我去睡了。

中间隔了四天。上班、睡觉、过日子，板子插着电搁桌上。

第二夜是 5 月 22 号凌晨，因为下班回家很晚了，我非常不想自己动脑和动手，我就把服务器的 SSH 开给 Claude，让它自己进去接着弄试试看。没想到这个流程跑得挺顺的。它加了天气图标，加了深度睡眠（30 分钟唤醒一次查数据和刷屏），这样一块锂电池能撑几个月。零点多到两点，完工。成品就是开头那张：一个云图标、21°C、阴，底下一行日期、湿度、电压。

## 中间的坑

坑不少但是也都好解决。随手列一下：

- 拉 ESPHome 的 Docker 镜像慢得离谱，换国内镜像
- 编译要从 GitHub 下东西，我这网络连不上 GitHub，得走代理
- 屏上有几个中文字显示成空心方块
- 固件刷上去，屏幕一刷新就把自己重启了，还自动回滚到旧版本
- 一个 176MB 的编译工具链，下载时被代理弄坏，反复重下
- 有一次编译怎么都不动，结果后台堆了七个编译进程在抢同一个目录

看起来多，但其实我点点同意就解决了。Claude 在那台服务器上自己跑命令、翻容器日志、抓设备日志，一层层往下扒。那个最缠人的「改什么都不生效」，它最后扒出来是：墨水屏刷新那一瞬间电流尖峰把芯片拉到欠压、触发复位，固件没启动成功就自动回滚回了旧版本。这条因果链我自己大概率查不出来，也没那个耐心。

我干的事就是：说我想要什么，偶尔看一下是不是卡住了，拍照发给 Claude 看效果，然后就是自己刷哔哩哔哩。整个过程算得上是决策的就一个：它想把欠压保护直接关掉绕过去，我说了句「不是应该避免同时启动吗」，它就改成把开机时几件耗电的事在时间上错开。

## 体感

跟 Pi 那次比，这次我更放权了。上次我好歹还盯着屏幕一句句说「这里转 180 度」「电量挪到顶上」；这次我都没怎么看，直接丢出 SSH，让 AI 在我服务器上自己跑命令。也算是从 AI 辅助编程进化到 Vibe Coding 了。工作项目我肯定不敢放权到这种地步，但是在家自己玩真的挺爽啊。

只要说明白需求，桌上真就多了块会自己显示天气的小屏。一块在抽屉里躺了不知道多久、搬家差点被嫌弃占位置丢掉的小开发板，现在摆在书架上，超低功耗运行，展示着今日天气，真不错。

## 完整配置

```yaml
substitutions:
  name: epaper-cloud
  friendly_name: "墨水屏云模块"
  # 改成你 HA 里实际的天气实体（开发者工具 > 状态，搜 weather.）
  weather_entity: weather.forecast_wo_de_jia

esphome:
  name: ${name}
  friendly_name: ${friendly_name}
  on_boot:
    priority: -100
    then:
      - if:
          condition:
            # 开机时按住按键 → 进 OTA 模式（保持常醒）
            binary_sensor.is_on: user_button
          then:
            - logger.log: "按键按住，保持常醒以便 OTA 更新"
            - deep_sleep.prevent: deep_sleep_ctl
            - wait_until:
                condition:
                  api.connected:
                timeout: 20s
            - wait_until:
                # 等 HA 把天气数据真正推过来，再刷屏（最多等 15s）
                condition:
                  lambda: 'return id(weather_state).has_state() && id(weather_temp).has_state() && id(weather_humidity).has_state();'
                timeout: 15s
            - component.update: epaper
          else:
            # 正常循环：等 HA 连上 → 等天气数据到位 → 刷屏 → 睡
            - wait_until:
                condition:
                  api.connected:
                timeout: 20s
            - wait_until:
                condition:
                  lambda: 'return id(weather_state).has_state() && id(weather_temp).has_state() && id(weather_humidity).has_state();'
                timeout: 15s
            - component.update: epaper
            - delay: 6s          # 等墨水屏全刷真正完成再睡
            - deep_sleep.enter: deep_sleep_ctl

esp32:
  board: esp32dev
  framework:
    type: arduino

# safe_mode 调试期关闭，稳定后可删
safe_mode:
  disabled: true

# 深度睡眠：定时 30min 醒一次，按键 GPIO12 也能唤醒
deep_sleep:
  id: deep_sleep_ctl
  sleep_duration: 30min
  wakeup_pin:
    number: GPIO12
    inverted: true       # 按键按下拉到 GND
    allow_other_uses: true
  wakeup_pin_mode: KEEP_AWAKE

logger:

api:
  encryption:
    key: !secret api_encryption_key

ota:
  - platform: esphome
    password: !secret ota_password

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  output_power: 8.5dB    # 降发射功率减射频电流
  ap:
    ssid: "${name} fallback"

captive_portal:

# 时间从 Home Assistant 取
time:
  - platform: homeassistant
    id: ha_time

text_sensor:
  - platform: homeassistant
    id: weather_state
    entity_id: ${weather_entity}

sensor:
  - platform: homeassistant
    id: weather_temp
    entity_id: ${weather_entity}
    attribute: temperature
  - platform: homeassistant
    id: weather_humidity
    entity_id: ${weather_entity}
    attribute: humidity
  - platform: adc
    pin: GPIO36
    name: "Battery Voltage"
    id: bat_voltage
    attenuation: 12db
    update_interval: 60s
    filters:
      - multiply: 3.0

binary_sensor:
  - platform: gpio
    id: user_button
    pin:
      number: GPIO12
      inverted: true
      allow_other_uses: true
      mode:
        input: true
        pullup: true
    name: "User Button"
    on_press:
      - component.update: epaper

# 天气图标：编译时按名字从 Material Design Icons 下载并渲染成 1-bit 图
image:
  - file: mdi:weather-sunny
    id: ic_sunny
    resize: 76x76
    type: BINARY
  - file: mdi:weather-night
    id: ic_night
    resize: 76x76
    type: BINARY
  - file: mdi:weather-cloudy
    id: ic_cloudy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-partly-cloudy
    id: ic_partlycloudy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-fog
    id: ic_fog
    resize: 76x76
    type: BINARY
  - file: mdi:weather-hail
    id: ic_hail
    resize: 76x76
    type: BINARY
  - file: mdi:weather-lightning
    id: ic_lightning
    resize: 76x76
    type: BINARY
  - file: mdi:weather-lightning-rainy
    id: ic_lightning_rainy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-pouring
    id: ic_pouring
    resize: 76x76
    type: BINARY
  - file: mdi:weather-rainy
    id: ic_rainy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-snowy
    id: ic_snowy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-snowy-rainy
    id: ic_snowy_rainy
    resize: 76x76
    type: BINARY
  - file: mdi:weather-windy
    id: ic_windy
    resize: 76x76
    type: BINARY

# 数字/西文用 Roboto，中文（天气词）用 Noto Sans SC
font:
  - file: "gfonts://Roboto"
    id: font_xl
    size: 46
    glyphs: "0123456789°C"
  - file: "gfonts://Noto+Sans+SC"
    id: font_md
    size: 20
    glyphs:
      - " 0123456789"
      - "晴夜阴多云雾冰雹雷雨大雪夹风异常未知"
  - file: "gfonts://Noto+Sans+SC"
    id: font_sm
    size: 14
    glyphs:
      - " -.%V0123456789"
      - "湿度"

spi:
  clk_pin: GPIO13
  mosi_pin: GPIO14

display:
  - platform: waveshare_epaper
    id: epaper
    cs_pin: GPIO15
    dc_pin: GPIO27
    busy_pin: GPIO25
    reset_pin: GPIO26
    model: 2.13in-ttgo-dke
    rotation: 90
    update_interval: never   # 由 on_boot/interval 驱动
    full_update_every: 30
    lambda: |-
      // 按 HA 天气代码挑图标 + 中文
      auto icon = id(ic_cloudy);
      std::string cond = "未知";
      if (id(weather_state).has_state()) {
        std::string s = id(weather_state).state;
        if (s == "sunny") { cond = "晴"; icon = id(ic_sunny); }
        else if (s == "clear-night") { cond = "晴夜"; icon = id(ic_night); }
        else if (s == "cloudy") { cond = "阴"; icon = id(ic_cloudy); }
        else if (s == "partlycloudy") { cond = "多云"; icon = id(ic_partlycloudy); }
        else if (s == "fog") { cond = "雾"; icon = id(ic_fog); }
        else if (s == "hail") { cond = "冰雹"; icon = id(ic_hail); }
        else if (s == "lightning") { cond = "雷"; icon = id(ic_lightning); }
        else if (s == "lightning-rainy") { cond = "雷雨"; icon = id(ic_lightning_rainy); }
        else if (s == "pouring") { cond = "大雨"; icon = id(ic_pouring); }
        else if (s == "rainy") { cond = "雨"; icon = id(ic_rainy); }
        else if (s == "snowy") { cond = "雪"; icon = id(ic_snowy); }
        else if (s == "snowy-rainy") { cond = "雨夹雪"; icon = id(ic_snowy_rainy); }
        else if (s == "windy" || s == "windy-variant") { cond = "大风"; icon = id(ic_windy); }
      }

      // 左：大天气图标
      it.image(6, 4, icon);

      // 右：大温度 + 状况文字
      if (id(weather_temp).has_state()) {
        it.printf(94, 6, id(font_xl), "%.0f°C", id(weather_temp).state);
      }
      it.printf(94, 56, id(font_md), "%s", cond.c_str());

      it.line(0, 90, 250, 90);

      // 底部：日期 / 湿度 / 电压
      it.strftime(6, 101, id(font_sm), "%Y-%m-%d", id(ha_time).now());
      if (id(weather_humidity).has_state()) {
        it.printf(116, 101, id(font_sm), "湿度 %.0f%%", id(weather_humidity).state);
      }
      it.printf(202, 101, id(font_sm), "%.2fV", id(bat_voltage).state);
```

这篇博客也是 Claude 写的初稿，但是我嫌弃 AI 味实在是太浓，就自己重写了一遍。
