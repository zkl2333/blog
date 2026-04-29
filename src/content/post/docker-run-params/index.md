---
title: "查看 docker run 参数命令"
description: "介绍 rekcod 和 runlike 两个工具，用于反向解析已运行 Docker 容器的完整启动参数。"
publishDate: "2025-12-04T11:12:02+08:00"
tags: ["docker", "运维", "工具"]
---

容器跑着跑着，忘了当初的启动参数，也没用 `docker-compose` 管理——这种情况可以用 **rekcod** 或 **runlike** 反向还原出完整的 `docker run` 命令。

## rekcod

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock nexdrew/rekcod <容器名>
```

## runlike

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock assaflavie/runlike <容器名>
```

两者用法相同，输出略有差异。`runlike` 的输出更接近标准 `docker run` 格式，`rekcod` 则会额外输出一些注释信息。

## 示例输出

以 EmbyServer 容器为例，还原出的命令如下：

```bash
docker run --name EmbyServer \
  --privileged \
  --runtime nvidia \
  -v /mnt:/mnt:rw \
  -v /mnt/user/appdata/EmbyServer:/config:rw \
  --net host \
  --restart no \
  --security-opt 'label=disable' \
  -h NAS002 \
  --expose 1900/udp \
  --expose 7359/udp \
  --expose 8096/tcp \
  --expose 8920/tcp \
  -e 'TZ=Asia/Shanghai' \
  -e 'NVIDIA_VISIBLE_DEVICES=GPU-5099c04d-07d6-50d5-5fec-92bb0f070789' \
  -e 'NVIDIA_DRIVER_CAPABILITIES=all' \
  -d \
  --entrypoint "/init" \
  emby/embyserver:latest
```

## 延伸：转换为 docker-compose

如果想进一步将 `docker run` 命令转换为 `docker-compose.yml`，可以使用 [composerize](https://www.composerize.com/)，支持命令行和网页两种方式。

## 参考

- [linuxea：如何复现查看 docker run 参数命令](http://www.linuxea.com/2270.html)
- [composerize：将 Docker 命令行转换为 docker-compose 格式](https://www.appinn.com/composerize-for-docker-compose/)
