---
title: "wsl 基本使用"
description: "This is the first post of my new Astro blog."
tags: ["wsl", "linux", "windows"]
---




## 安装

Microsoft Store 装安装

安装后首次启动会让你设置用户名，密码。更换默认用户为 root: <https://superuser.com/questions/1566022/how-to-set-default-user-for-manually-installed-wsl-distro>

`.wslconfig` 文件参考：<https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config#wslconfig>

`wsl cli` 参考：<https://learn.microsoft.com/zh-cn/windows/wsl/basic-commands>

## 卸载

 1. `wsl --unregister Ubuntu`
 2. 利用 `Bulk Crap Uninstaller` 卸载干净

## 更换 Ubuntu apt-get 源

方法： <https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/>

源： <http://mirrors.aliyun.com/ubuntu/>

> 在 Ubuntu 24.04 之前，Ubuntu 的软件源配置文件使用传统的 One-Line-Style，路径为 `/etc/apt/sources.list`；从 Ubuntu 24.04 开始，Ubuntu 的软件源配置文件变更为 DEB822 格式，路径为 `/etc/apt/sources.list.d/ubuntu.sources`。

## 安装 docker

<https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository>

## docker 镜像

<https://github.com/DaoCloud/public-image-mirror>

<https://status.daocloud.io/status/docker>

```sh
sudo tee /etc/docker/daemon.json <<EOF
 
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io"
    ]
}
EOF
 
sudo systemctl daemon-reload
sudo systemctl restart docker
```

> 镜像也慢，不如代理

## proxy

使用代理： <https://docs.docker.com/engine/daemon/proxy/>

但wsl的网络模式影响，nat 不能访问主机代理，换成 mirrored

代理设置参考：<https://george.betterde.com/technology/20240608.html>

`/etc/docker/daemon.json`

```json
{
  "proxies": {
    "no-proxy": "*.local,localhost,127.0.0.0/8",
    "http-proxy": "http://IP_OR_DOMAIN:6152",
    "https-proxy": "https://IP_OR_DOMAIN:6152",
  }
}
```

`~/.docker/config.json`

```json
{
 "proxies": {
   "default": {
     "httpProxy": "http://127.0.0.1:7890",
     "httpsProxy": "http://127.0.0.1:7890",
     "noProxy": "*.local,localhost,127.0.0.0/8"
   }
 }
}
```

## 在 WSL 中访问 Windows 文件有几种便捷的方法

1. 通过 `/mnt` 目录访问

- Windows 的磁盘会自动挂载在 `/mnt` 目录下
- 比如 C 盘路径为 `/mnt/c`，D 盘为 `/mnt/d`
- 示例: `cd /mnt/c/Users/YourName/Documents`

1. 通过符号链接创建快捷方式

```sh
# 在 home 目录下创建到 Windows Documents 文件夹的链接
ln -s /mnt/c/Users/YourName/Documents ~/Documents
# 快速访问
cd ~/windows_desktop
```

配置 `/etc/wsl.conf` 来自定义挂载点

需要注意的几点：

- WSL 访问 Windows 文件时性能会比直接在 Linux 文件系统中操作稍慢
- 建议将开发项目文件放在 WSL 文件系统中以获得更好的性能

性能差异的原因：

- 当你通过 `/mnt/c` 访问 Windows 文件时，WSL 需要在Windows 和 Linux 文件系统之间进行转换，这会带来额外的开销
- 在 Linux 文件系统中直接操作文件时，不需要这种转换，所以性能好

若需频繁操作，建议将文件复制到 WSL 原生目录

```sh
# 在 Windows 文件系统中运行 npm install
cd /mnt/c/projects/my-node-app
npm install  # 较慢

# 在 Linux 文件系统中运行 npm install
cd ~/projects/my-node-app
npm install  # 更快
```

```sh
# 打开当前目录对应的 Windows 文件夹
explorer.exe .
```

```sh
# 将 Windows 路径转为 WSL 路径
wslpath "C:\Users\你的用户名\Downloads"
# 输出：/mnt/c/Users/你的用户名/Downloads

# 将 WSL 路径转为 Windows 路径
wslpath -w ~/documents
# 输出：\\wsl.localhost\Ubuntu\home\用户名\documents

```

## troubleshooting

**wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。**

<https://github.com/microsoft/WSL/issues/10753#issuecomment-1814839310>

<https://github.com/microsoft/WSL/releases/tag/2.0.0>

**找不到被占用的端口**

- hyper-v 占用
  - wsl
  - wsa 杀进程

```sh
netsh interface ipv4 reset
netsh interface ipv6 reset
netsh winsock reset 

netsh int ipv4 add excludedportrange protocol=tcp startport=3000 numberofports=100

Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
```

<https://stackoverflow.com/questions/58216537/what-is-administered-port-exclusions-in-windows-10>
