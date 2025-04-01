---
title: Linux Basic Command
description: Linux Basic Command
coverImage: 
tags:
  - linux
---

## systemctl

```sh
# 启动服务 
systemctl start openvpn.service 
# 重启服务 
systemctl restart openvpn.service 
# 停止服务 
systemctl stop openvpn.service 
# 禁止开机启动 
systemctl disable openvpn.service 
# 启用开机启动 
systemctl enable openvpn.service
# 查看状态
systemctl status openvpn.service
```

### 服务状态

1. Active (运行状态):
   - `active (running)` 服务正在运行
   - `active (exited)` 服务成功执行单次任务后退出
   - `active (waiting)` 服务等待某个条件触发
   - `inactive (dead)` 服务未运行
   - `failed` 服务启动失败
1. Loaded (单元文件状态):
   - `loaded` 单元文件已加载
   - `not-found` 单元文件不存在
   - `masked` 服务被强制屏蔽（无法启动）
1. 其他关键信息:
   - `enabled` 服务已设为开机启动
   - `disabled` 服务未设为开机启动
   - `static` 服务不能单独启用，可能被依赖项调用