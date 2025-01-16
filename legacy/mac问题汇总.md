# mac问题汇总

> 记录macos初次使用的一些问题

## 显卡切换
`sudo pmset -a GPUSwitch i`     
`i` = `0`/`1`/`2` `cpu`/`gpu`/`auto`
外接显示器必须得开独显，贼坑

## 强制退出程序
`cmd` + `opt` + `esc`

## 三指拖动
`偏好设置` -> `辅助功能` -> `指针控制` -> `触控板选项`

## homebrew 
```shell
mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
```

## 环境变量
默认的`sehll`是`zsh`, 需要将`~/.bashrc`,`~/.bash_profile`,`/etc/profile`中的变量移到`zshrc`中， 或是在`zshrc`中`source`下`bash`中的变量

## 同程序不同窗口切换
`cmd` + `~`

## 同窗口不同标签
`cmd` + `opt` + `<`/`>`


## Quicktime录屏，仅录制内部声音
安装soundflower插件，再到音频MIDI设置中添加聚集与多输出设备


## [vscode代码补全tab切换](https://www.zhihu.com/question/62743695/answer/1054302289)
`command + shift + p`,  `Preference: Open keyboard Shortcuts(Json) `
```json
[
    {
        "key": "tab",
        "command": "acceptSelectedSuggestion",
        "when": "suggestWidgetVisible && textInputFocus"
    },
    {
        "key": "shift+tab",
        "command": "acceptSelectedSuggestion",
        "when": "suggestWidgetVisible && textInputFocus"
    },
    {
        "key": "tab",
        "command": "selectNextSuggestion",
        "when": "editorTextFocus && suggestWidgetMultipleSuggestions && suggestWidgetVisible"
    },
        {
        "key": "shift+tab",
        "command": "selectPrevSuggestion",
        "when": "editorTextFocus && suggestWidgetMultipleSuggestions && suggestWidgetVisible"
    }
]
```


## [zsh配置](https://www.freecodecamp.org/news/how-to-configure-your-macos-terminal-with-zsh-like-a-pro-c0ab3f3c1156/)
```shell
brew install zsh
brew cask install iterm2
git clone https://github.com/ohmyzsh/ohmyzsh.git ~/.oh-my-zsh
cp ~./oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
#chsh -s /bin/zsh

# theme
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k

# Inconsolata Powerline font
git clone https://github.com/powerline/fonts.git
cd font
./install.sh

git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions



# .zshrc
#ZSH_THEME="powerlevel9k/powerlevel9k"
#plugins=(git zsh-autosuggestions zsh-syntax-highlighting z history-substring-search history )
```
[.zshrc](https://www.zhihu.com/question/21418449)
## [asynctask](https://www.zhihu.com/question/20620445/answer/1063450249)
```shell
brew install fzf

mkdir ~/github
cd ~/github
git clone --depth 1 https://github.com/skywind3000/asynctasks.vim

mkdir -p ~/.config/asynctask/
echo -e '[git-fetch-master]
command=git fetch origin master
cwd=<root>

[git-checkout]
command=git checkout $(?branch)
cwd=<root>' > ~/.config/asynctask/tasks.ini

sudo ln -s /Users/wcw/github/asynctasks.vim/bin/asynctask /usr/local/bin
echo alias task='asynctask -f' >> ~/.zshrc    
echo bindkey -s "'\\e[15~'" "'task\\n'" >> ~/.zshrc
source ~/.zshrc 

```


## WireShark权限
```shell
sudo chown wcw bp*
```


## Xcode c IO输出
左侧`navigator`的`Products`， 右键项目， `Show in finder`  

## vscode 上下次位置
`win10`  `alt + <-/->`
`mac`     `ctl + shift +  - / ctl + -`


## Xcode malloc incorrect checksum
`cmd` + `8`切换断点导航栏， 左下角➕选择`Symbol`断点， 然后在`Symbol`字段下添加`malloc_error_break`, `module`会默认匹配到`libsystem_malloc.dylib` ， 添加`action`, `bt(backtrace)`, 即可像`python`那样打印异常栈， 

其实也可以直接在报错的调试栏进行的交互式`lldb`来手动打印`bt`， 定位代码段， 打印变量， 地址
`Product`下的`Scheme`可以设定各种`malloc`的守护机制， 帮助定位`malloc`错误

## Xcode lib location
`Xcode`默认的`IDE lib`是不包括`openssl`的， 而`mac`又是自带`openssl`的， 只需要将`openssl`的`include`软连接到`Xcode`的`include`下，

应用->平台->`SDK`，臭长臭长的`/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/`

`which、where`的话，只能看可执行文件的位置， 万能的`google`还是能找到， `lib`通常会在`/usr/local`, `binary`则是`/usr/bin` ，
`sudo ln -s /usr/local/opt/openssl/include/openssl .`
然后就能正常`#include <openssl/ssl.h>`

<!-- 2020年6月25日 09:40 -->