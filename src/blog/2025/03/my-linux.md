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