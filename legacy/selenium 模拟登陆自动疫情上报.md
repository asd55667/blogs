# selenium 模拟登陆自动疫情上报

> 疫情解封后 回学校每天的疫情状况上报 正好有阿里云服务器 写个脚本懒得手动操作了

准备好稳定的云服务器

```shell
sudo echo -e "[google]
name=google
baseurl=http://dl.google.com/linux/chrome/rpm/stable/$basearch
enabled=1
gpgcheck=1
gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub" > /etc/yum.repos.d/google-chrome.repo

# install chrome
yum -y install google-chrome-stable --nogpgcheck

pip3 install selenium

wget http://chromedriver.storage.googleapis.com/84.0.4147.30/chromedriver_linux64.zip /home/wcw

unzip /home/wcw/chromedriver_linux64.zip

chmod u+x /home/wcw/chromedriver

source /etc/profile

crontab -e
# 15 0-11 * * * /usr/local/bin/python3 /home/wcw/cwl.py
```

```python
import sys
from selenium.webdriver.chrome.options import Options
from selenium import webdriver

import time

chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
#chrome_options.add_argument('window-size=1920x3000')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--hide-scrollbars')
chrome_options.add_argument('blink-settings=imagesEnabled=false')
chrome_options.add_argument('--headless')

browser = webdriver.Chrome(executable_path='/home/wcw/chromedriver', options=chrome_options)


def click(xpth, t = 1):
    browser.find_element_by_xpath(xpth).click()
    time.sleep(t)

def fuck():
    start_time = 0
    try:
        print('start')
        browser.get('http://xgfy.sit.edu.cn/h5')
        #import ipdb;ipdb.set_trace()

        account = browser.find_element_by_xpath('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view/div/div/div/uni-view[1]/uni-view[1]/uni-input/div/input')
        account.send_keys("学号")

        passwd = browser.find_element_by_xpath('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view/div/div/div/uni-view[1]/uni-view[2]/uni-input/div/input')
        passwd.send_keys("密码")
        
        # login click
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[3]/uni-view[2]/uni-button')

        print('login')

        try:
            click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[3]/uni-view[2]/uni-button', t=3)
        except: pass

        # assert click
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[3]/uni-view[2]/uni-button',t=3)


        # import ipdb;ipdb.set_trace()
        # report click
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[2]', t=5)
        print('report')

        # temp click
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view[2]/div/div/div/uni-view[1]/uni-view[3]/uni-view[3]/uni-view[2]/uni-radio-group/uni-label[1]/uni-radio/div/div')

        # health
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view[2]/div/div/div/uni-view[1]/uni-view[3]/uni-view[5]/uni-view[2]/uni-picker/div[2]/uni-view')

        # health normal
        click('/html/body/uni-app/div/div[2]/uni-picker-view/div/uni-picker-view-column/div/div[3]/div[2]')

        # health click
        click('/html/body/uni-app/div/div[2]/div/div[2]')

        # location
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view[2]/div/div/div/uni-view[1]/uni-view[3]/uni-view[6]/uni-view[2]/uni-button')
        # location click
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[3]/uni-view[2]/uni-view[2]/uni-picker-view/div/uni-picker-view-column[1]/div/div[3]/uni-view[1]')
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[3]/uni-view[2]/uni-view[1]/uni-view[2]/uni-text/span')

        print('post')
        # final
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-scroll-view[2]/div/div/div/uni-view[1]/uni-view[4]/uni-button')
        click('/html/body/uni-app/uni-page/uni-page-wrapper/uni-page-body/uni-view/uni-view[2]/uni-view/uni-view[1]/uni-view[1]')

        if time.time() - start_time > 600:
            browser.close()
            print('timeout')
            return
        print('success')
        browser.close()
    except Exception as e:
        # browser. close()
        print('fail')
        browser.close()

if __name__ == '__main__':
    fuck()       
```


跑了一段时间才发现`selenium`的`webdriver`开了一大堆进程， 每天上报完后清理进程，脚本`clean.sh`
```shell
pid=`ps -ef | grep chrome | grep -v grep | awk '{print $2}'`
if [ -n "$pid" ]
then
    echo "kill -9 pid:"$pid
    kill -9 $pid
fi
```

```shell
crontab -e
# 0 12 * * * /home/wcw/clean.sh
```

<!-- 2020年7月31日 09:24  -->