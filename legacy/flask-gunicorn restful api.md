<!--
updated: 2020年7月8日 13:21
tags: [flask, gunicorn, python, nginx, mysql, restful]
-->

# flask-gunicorn restful api

> 疫情后在家小公司实习部署的简易python服务

选择解释器
```shell
whereis python
```
创建虚拟环境
```shell
visualenv interpreter wordcat
```
激活环境
```shell
source wordcat/bin/activate
```
安装flask gunicorn， 准备好服务代码
开启4个子线程，绑定8000端口，任意ip均可访问，参数对应， 代码更新自动reload
```shell
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app --reload
```
centos7下systemctl挂gunicorn的daemon没挂上[下次ubuntu上再试试](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-18-04)

nginx配置文件中服务器添加回环端口
```txt
location /{
    proxy_pass http://127.0.0.1:8000;
}
```

mysql5.7数据库建库时一定要制定编码格式，高版本没这问题了， 默认是latin
建库
```sql
CREATE DATABASE `wordcat` CHARACTER SET utf8 COLLATE utf8_general_ci;
```
建表
```sql
CREATE TABLE `words` (
    `index` INT NOT NULL auto_increment primary key,
    `word` varchar(255) DEFAULT NULL,
    `n.`   varchar(255) DEFAULT NULL,
    `adj.` varchar(255) DEFAULT NULL,
    `v.`   varchar(255) DEFAULT NULL,
    `adv.` varchar(255) DEFAULT NULL,
    `pron.`varchar(255) DEFAULT NULL,
    `conj.`varchar(255) DEFAULT NULL,
    `aux.` varchar(255) DEFAULT NULL,
    `phonetic` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 auto_increment=1;
```
上传路径
```sql
SHOW VARIABLES LIKE "secure_file_priv";
```
导入csv
```sql
load data infile '/var/lib/mysql-files/first-part-utf-8.csv' 
into table words 
fields terminated by ',' optionally enclosed by '"' escaped by '"'
lines terminated by '\r\n'
ignore 1 lines;
```

查看编码
```sql
show variables like 'character%';
```
修改配置文件
```shell
echo -e "[client]\n\
default-character-set=utf8\n\
[mysqld]\n\
character-set-server=utf8\n\
[mysql]\n\
default-character-set=utf8\n" >>  /etc/my.conf

service mysqld restart 
```
建库时未设置编码后面修改还是容易被重置
其结果是：
query中文会乱码
调用api返回单字节十六进制
比如query`重量`这个词返回的`unicode binary`为`\\u00e9\\u2021\\u008d\\u00e9\\u2021\\u008f`，
`json.loads`后得到的`utf8`为`é‡\x8dé‡\x8f`,单个可显示的字节会显示为latin，而且不易被转换会十六进制
`latin`与十六进制`\x`组合一起并不能调用`decode`方法

重建库设置utf8编码后，返回的响应为`\\u91cd\\u91cf`，可直接解码为中文， 库中select的中文也不乱码
