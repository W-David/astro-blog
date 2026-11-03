---
title: "阿里云重装踩坑记录"
description: "阿里云误删后重装与环境恢复踩坑记录。"
pubDate: 2022-12-16
category: "记录"
tags:
  - "阿里云"
---

## 起因
> **提示**
>
> root 登录， 手残使用了 `rm -rf /*` 命令，(少加了个.) 以后要用 `trash` 代替并做好系统镜像备份，使用 `rm` 命令一定要万分小心啊



## 重装
> **说明**
>
> 由于没有做备份，只能重装了，环境和服务全部重新安装一遍，就当是回顾一下服务器部署过程吧，顺便把这次过程记录下来，方便以后查阅参考


## 操作步骤

### 1. 重装系统
登录账号，选择重置系统即可，WO 选择了重置当前系统，保留防火墙配置，这一步比较简单，过程略过

#### 系统环境

```bash
// 内核信息/操作系统/CPU信息
$ uname -a
Linux iZ8vbc7vrn6acc5hhxv80pZ 5.4.0-47-generic #51-Ubuntu SMP Fri Sep 4 19:50:52 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
// OS 版本
$ cat /etc/issue
Ubuntu 20.04.5 LTS \n \l
```

### 2. 安装工具

#### 2.1 配置 ssh 连接

> 阿里云的配置比较简单，在控制台的 `远程连接` 生成密钥对，将私钥下载到本地，再配置密钥登录即可

一般的过程如下:

- 在本地生成密钥对，将生成的公钥复制到远程服务器的 /{userPath}/.ssh/authorized_keys 文件夹内  
```bash
ssh-copy-id -i ~/.ssh/{publicKeyFileName} {userName}@{remoteIP}
```
- 设置此文件夹的权限为 -rw------
```bash
chmod 600 authorized_keys
```
- 登录配置（简化登录命令），编辑或创建 {userPath}/.ssh/config 文件, 配置后即可使用 ssh {hostName} 远程登录, 内容如下:
```bash
Host {hostName}
HostName {remoteIP}
User {remoteUserName}
IdentityFile {indentityFile Path}
```

#### 2.2 oh-my-zsh

- 准备工作
  ```bash
  sudo apt-get update
  sudo apt-get upgrade
  sudo apt-get install zsh git
  ```
- 安装 `oh-my-zsh`
  - 官网
  ```bash
  // curl
  curl sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  // wget
  wget sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
  ```
  - 镜像
    - 下载
    ```bash
    https://gitee.com/mirrors/oh-my-zsh/blob/master/tools/install.sh
    ```
    - 修改
     ```bash
    REMOTE=${REMOTE:-https://github.com/${REPO}.git}
    // 修改为
    REMOTE=${REMOTE:-https://gitee.com/mirrors/oh-my-zsh.git}
     ```
    - 运行
      `install.sh`
- 插件
  - 下载 zsh-autosuggestions
  ```bash
  git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
  ```
  - 下载 zsh-syntax-highlighting
  ```bash
  git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
  ```
  - 配置 oh-my-zsh
  ```bash
  vim ~/.zshrc
  plugins=(git z zsh-autosuggestions zsh-syntax-highlighting )
  ```

### 3. 环境配置

#### 3.1 node

- 安装 nvm
  1.  安装基础软件
  ```bash
  sudo apt install build-essential libssl-dev
  ```
  2. git 手动安装 (使用国内镜像)
  ```bash
  git clone https://gitee.com/mirrors/nvm .nvm
  cd .nvm
  sh nvm.sh
  ```
  3.  配置 nvm 环境
  ```bash
  vim ~/.zshrc
  // 添加如下内容
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
  # 支持 .nvmrc 分项目配置node版本功能
  autoload -U add-zsh-hook
  load-nvmrc() {
    local node_version="$(nvm version)"
    local nvmrc_path="$(nvm_find_nvmrc)"
    if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")
    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
    elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
    fi
  }
  add-zsh-hook chpwd load-nvmrc
  load-nvmrc
  // 配置生效
  source ~/.zshrc
- 安装 node
  ```bash
  nvm -v
  nvm install 16.15.1
  nvm install 18.5.0
  nvm install 14.18.0
  nvm alias old v14.18.0
  nvm alias high v18.5.0
  ```

#### 3.2 nginx

- 安装
  ```bash
  sudo apt-get update
  sudo apt-get upgrade
  sudo apt-get install nginx
  ```
- 配置说明
  - `/etc/nginx/`: 所有配置文件均在此目录下
  - `/etc/nginx/nginx.conf`: `nginx` 的主配置文件
  - `/etc/nginx/sites-avaliable`: 存放每个站点的配置文件（配置文件都在这里）
  - `/etc/nginx/sites-enabled`: 存放站点配置文件的软链接（如果某个站点关闭，可将软连接删除，方便管理）

#### 3.3 mysql

- 安装
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl status mysql 
```
- 配置
  ```bash
  //初次安装可以直接进入
  sudo mysql 
  mysql> alter user 'root'@'localhost' identified with mysql_native_password by 'yourpassword' //修改 root 密码
  exit
  sudo mysql_secure_installation
  // 运行这个脚本会遇到几个选择, 以下是我的选择
  // 1. 不安装密码验证插件
  // 2. 设置一个 root 密码, 若已经按照上述步骤设置，则为修改密码, 选择不修改
  // 3. 移除任何匿名用户，限制 root 用户访问本地机器，移除测试数据库并重新加载权限表
  ```

### 4. 启动服务
