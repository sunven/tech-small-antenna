---
title: My Windows
description: my windows
coverImage: 
tags:
  - windows
---

## scoop

<https://gist.github.com/sunven/2a6ecebefcaadeea95b5a4f6ee3321c2>

## PicGo

1. scoop 安装 [PicGo](https://github.com/Molunerfinn/PicGo) `scoop install picgo`
2. 根据文档设置 github 图床
3. 禁用快捷键，Ctrl+Shift+P 冲突

### 使用 Nilesoft Shell 设置右键菜单

```
item(title='Upload by PicGo' image=image('D:\Applications\Scoop\apps\picgo\current\PicGo.exe', 0) cmd='picgo' args='upload "@sel.path"')
```

## PowerShell

- Get-InstalledModule
- Get-InstalledScript
- $Profile

## 问题

### I 形光标在输入框变透明

<https://nvidia.custhelp.com/app/answers/detail/a_id/5157>