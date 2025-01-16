# mysql 配置

> 总是忘 当时记录觉得后面可能会用得上的

### 同一`ip`短时间内过多的连接错误 Host ‘XXXXXX’ is blocked because of many connection errors

查看阈值
`show global variables like '%max_connect_errors%';`

清除缓存
`flush hosts;`

### 连接权限    1130-host ... is not allowed to connect to this MySql server
 查看表字段
`show full columns from table`

权限信息
`select Host, User, authentication_string from user;`

允许外部连接
`update user set Host='%' where User='user'; flush privileges;`

给予全部权限
`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%'WITH GRANT OPTION;flush privileges;`

<!-- 2020年8月8日 10:41  -->