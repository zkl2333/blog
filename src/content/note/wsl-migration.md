---
title: "WSL 迁移"
description: "介绍如何将 WSL（Windows Subsystem for Linux）中的发行版迁移到其他磁盘路径，以 Docker Desktop 数据盘为例。"
publishDate: "2023-10-23T00:00:00+08:00"
tags: ["wsl", "docker", "windows"]
---

WSL 发行版默认安装在系统盘，长期使用后占用空间较大。通过导出再导入的方式，可以将其迁移到其他磁盘，以 Docker Desktop 的数据盘为例。

## 关闭所有发行版

```bash
wsl --shutdown
```

## 备份原有镜像

```bash
wsl --export docker-desktop-data D:\wsl\docker-desktop-data\docker-desktop-data.tar
```

## 注销原发行版

```bash
wsl --unregister docker-desktop-data
```

## 导入到新路径

```bash
wsl --import docker-desktop-data D:\wsl\docker-desktop-data\ D:\wsl\docker-desktop-data\docker-desktop-data.tar --version 2
```

迁移完成后，Docker Desktop 会自动识别并使用新路径的数据。
