---
title: My Linux
description: 我的 Linux
coverImage: 
tags:
  - linux
  - settings
---

## starship + fish

1. 安装 [fish](https://github.com/fish-shell/fish-shell#packages-for-linux)
	1. 设置默认 shell `chsh -s $(which fish)`
2. 安装 [starship](https://github.com/starship/starship#-installation)

### 解决 nvm, node 不识别

方法 1：

1. 安装 [fisher](https://github.com/jorgebucaran/fisher#installation)
2. 安装 [bass](https://github.com/edc/bass#with-fisher)
3. <https://github.com/nvm-sh/nvm#fish>

方法 2（未尝试）：

[nvm.fish](https://github.com/jorgebucaran/nvm.fish)

### pnpm 不识别

执行 `pnpm setup`

### pnpm 命令补全

参考：<https://pnpm.io/completion>

```sh
pnpm completion fish > ~/.config/fish/completions/pnpm.fish
```

## OpenVPN

开机启动

```sh
sudo vim /usr/lib/systemd/system/openvpn.service
```

修改 `Type` 和 `ExecStart`，如下：

```sh
[Unit]
Description=OpenVPN service
After=network.target

[Service]
Type=simple
RemainAfterExit=yes
ExecStart= /usr/sbin/openvpn --config /etc/openvpn/VPNConfigBJ.ovpn
WorkingDirectory=/etc/openvpn

[Install]
WantedBy=multi-user.target
```

### 报错

```
#cipher AES-256-CBC
```

算法替换：

```
data-ciphers AES-256-GCM:AES-128-GCM:AES-256-CBC  # 添加 AES-256-CBC 以兼容旧服务端
data-ciphers-fallback AES-256-CBC 
```