# wordpress个人网站部署

> 第一次LNMP部署个人博客 跟着jack-cui的博客学习

之前学AI的时候经常有看这个博主的文章[https://cuijiahua.com/](https://cuijiahua.com/)，挺欣赏他的， 这期间也有好多次萌生整个个人博客的想法，也是该好好记录下学习的历程，偶尔也能回顾下学过的知识，更多的还是自娱自乐吧， 以后要是有机会也想自己从头构建个自己博客架构，现在还太菜了， 一点点学吧。当前阶段主要是对内， 文章也没写几篇， 想太多也没用，先会用也行。
开始有用一键式的LNMP那些试了下，后面想了想感觉还是想自己折腾
## wordpress + nginx in centos7
```SHELL
#adduser
adduser wcw
passwd wcw

#change source
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
cd /etc/yum.repos.d/
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
yum makecache
yum -y update

# package
sudo yum install vim
sudo yum install tmux
sudo yum install tree
sudo yum install unzip
```
## nginx
```SHELL
sudo yum install epel-release
# nginx 
# configure dir     /etc/nginx  
# log dir           /var/log/nginx/ 
yum install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## mysql5.7 php7.3
```SHELL
## mysql
sudo yum localinstall https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
sudo yum install mysql-community-server

sudo systemctl enable mysqld
sudo systemctl start mysqld
sudo grep 'temporary password' /var/log/mysqld.log > mysql_passwd.txt
# sudo mysql_secure_installation

## php7.3
 sudo yum install epel-release yum-utils
sudo yum install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
sudo yum-config-manager --enable remi-php73
sudo yum install php php-common php-opcache php-mcrypt php-cli php-gd php-curl php-mysqlnd
```

### 修改fpm配置文件，替换apache为nginx
```
`modify /etc/php-fpm.d/www.conf`
`...`
`user = nginx`
`...`
`group = nginx`
`...`
`listen = /run/php-fpm/www.sock`
`...`
`listen.owner = nginx`
`listen.group = nginx`

```

```SHELL
chown -R root:nginx /var/lib/php
sudo systemctl enable php-fpm
sudo systemctl start php-fpm

sudo yum install phpmyadmin
sudo chgrp -R nginx /etc/phpMyAdmin
sudo mkdir -p /etc/nginx/snippets
cp phpMyAdmin.conf /etc/nginx/snippets/
# access http(s)://your_domain_or_ip_address/phpmyadmin
```

## ssl证书， letsencrypt
安装会有些python的依赖问题， 重装下
```SHELL
## ssl
sudo pip uninstall requests
sudo pip uninstall urllib3
sudo yum remove python-urllib3
sudo yum remove python-requests
rpm -qa | grep requests 
pip freeze | grep requests
sudo yum install python-urllib3
sudo yum install python-requests

sudo yum install certbot python2-certbot-nginx

sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

## 添加解析记录
手动certbot后要在阿里云的解析规则里加TEXT记录
将终端的ID粘贴到记录值，并修改对应的前缀
要添加域名的前缀 www.wuchengwei.icu, custom.wuchengwei.icu，要一一添加记录
周期任务crontab命令有些问题，还没改， 其实感觉手动也没多麻烦
```SHELL
sudo mkdir -p /var/lib/letsencrypt/.well-known

sudo chgrp nginx /var/lib/letsencrypt

sudo chmod g+s /var/lib/letsencrypt

sudo mkdir /etc/nginx/snippets

sudo certbot --manual --preferred-challenges dns certonly 

cp letsencrypt.conf /etc/nginx/snippets/
cp ssl.conf         /etc/nginx/snippets/
cp wuchengwei.icu.conf /etc/nginx/conf.d/

# sudo crontab -e
# 0 */12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(3600))' && certbot -q renew --renew-hook "systemctl reload nginx"
# sudo certbot renew --dry-run
```
## mysql访问权限
```sql
## wordpress database
# CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
# GRANT ALL ON wordpress.* TO 'wordpressuser'@'localhost' IDENTIFIED BY 'change-with-strong-password';
# FLUSH PRIVILEGES;
# EXIT;
```

## wordpress
```SHELL
sudo mkdir -p /var/www/html/wuchengwei.icu
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar xf latest.tar.gz
sudo mv /tmp/wordpress/* /var/www/html/wuchengwei.icu/
sudo chown -R nginx: /var/www/html/wuchengwei.icu
```


## ssh自动登陆
`$ssh-keygen -t rsa`
`$ssh-copy-id -i ~/.ssh/id_rsa.pub root@wuchengwei.icu`

## 添加systemctl服务
配置文件的启动执行需要加上bash
```
.service file
systemd service 203/EXEC failure (no such file or directory)
ExecStart=/bin/bash command
```


## wordpress页面对应分类文章入口
仪表盘 -> 外观 -> 菜单 -> 将分类/文章/链接添加到导航栏菜单

## wordpress布局修改
在浏览器中`Ctl+Shift+c`打开devTool抓取element， 在下面的style属性中对应的修改样式， 再找到主题目录下的style.css文件， 针对性的修改属性，参数， 原文件记得要备份



#### reference
[nginx](https://linuxize.com/post/how-to-install-nginx-on-centos-7/)
[mysql](https://linuxize.com/post/install-mysql-on-centos-7/)
[phpadmin](https://linuxize.com/post/how-to-install-phpmyadmin-with-nginx-on-centos-7/)
[ssl](https://linuxize.com/post/secure-nginx-with-let-s-encrypt-on-centos-7/)
[wordpress](https://linuxize.com/post/how-to-install-wordpress-with-nginx-on-centos-7/)

<!-- 2020年6月5日 16:54  -->