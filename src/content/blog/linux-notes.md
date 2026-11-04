---
title: "Linux 学习笔记"
description: "Linux 启动过程与常用命令笔记。"
pubDate: 2019-06-20
heroImage: ../../assets/images/post-desk.jpg
category: "运维"
tags:
  - "linux"
---

## linux 系统启动过程

### linux 系统的启动过程可以分为 5 个阶段：
- 内核的引导
- 运行 init
- 系统初始化
- 建立终端
- 用户系统登录

## linux 常用命令

### 目录类:
```bash
1. ls 列出当前目录下的所有文件夹
   ls -a 包括隐藏文件
   ls -l 列出文件权限
   ls -la al组合
   ls -lh 常用，易读方式列出文件
   ls -lS 按文件大小降序排序
2. cd 改变工作目录
3. mkdir 创建目录
4. rmdir 删除空目录
5. cp 复制文件
6. mv 移动文件
7. du 显示文件使用的磁盘空间量
8. rm 删除文件或目录（不管是否为空）
9. tree 显示目录数的树状图表
10. file 显示文件的类型
11. chmod 更改文件或目录的文件权限
    ugo : user, group,other 分别表示当前用户，组用户，其他用户
    +-： 增加，删除权限
    rwx: read,write,execute 读写，执行权限
    对应数字： r:4 w:2 x:1
    d: 文件夹
    -： 文件
    drwxr-xr-x : 此文件夹对于当前用户具有全部权限，组用户和其他用户只可读和可执行,无法写入
12. pwd 显示当前路径
```

### 构建块:
```bash
1. cat  以文本方式显示文件 （tac 倒着显示）
2. touch 文件存在刷新时间戳，不存在则创建文件和时间戳
3. alias 创建/显示别名 （unalias 删除别名）
4. echo 将数据写到标准输出，一般可以配合管道命令写入到文件中
5. less 分屏显示数据
6. more 分屏显示数据
7. head 从数据的开头选择行
8. tail 从数据的末尾选择行
```

### 工具类：
```bash
1. man 查看命令的帮助
2. --help 与 man 作用相同
3. tldr  `too long don't read`工具
4. whatis 查看命令的介绍
5. whereis 命令所在位置
6. find ToFindLocation -name FileName
7. grep [-l -v] "findString" ToFindPath
```
