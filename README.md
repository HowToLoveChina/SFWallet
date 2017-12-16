## 环境准备 ##
*   安装nodeJs,并设置好环境变量

## 如何使用工程 ##
1.  获取工程代码
2.  终端: cd 工程目录
3.  npm install 
4.  bower install安装之前执行git config --global url."https://".insteadOf git:// 
5.  启动本地服务器
    gulp serve 
6.  构建代码（提供给测试或生产部署）
    gulp build


## 技术选型 ##
*   jQuery
*   angularJs
*   sass(ionic)
*   bower 模块／包管理器
*   gulp
    代码检测
    合并压缩混淆
    编译（sass）
    web服务器（reload）
    代理（调试接口、解决跨越问题）
*   nginx
    web服务器（负载、代理)

## 注意事项 ##
### 必须提交代码库的文件： ###
*   app 
*   (test) 
*   bower.json 
*   package.json 
*   gulpfile.js 
*   dist (由gulp构建工具自动生成，里面的版本文件夹由package.json来生产，发一次版，一个版本号。如同maven工程的pom文件一样)
    V1.0.0 -> 0329的版本
    V1.0.1 -> 0429的版本


### 不需要提交代码库的文件： ###
*   node_modules


## 参考文档 ##
*   http://ionicframework.com/docs/
*   https://docs.angularjs.org
*   http://sass-lang.com
*   http://gulpjs.com/
*   http://docs.mobiscroll.com/2-17-1/datetime


## 奇技淫巧 ## 
1.  如何不用每个项目npm安装一遍开发依赖？
*   终端窗口： cd 项目文件夹
    cd /Users/qiaoyun.xie/sfpayProjects/sfpay-nirvana
*   新建node_modules文件夹：
    mkdir node_modules
*   设置软链接：
    *nix
        ln -s 源文件  目标文件
        ln -s /Users/qiaoyun.xie/sfpayProjects/sfpay-nirvana/node_modules ~/node_modules 
    windows 系统：
        mklink /?
        创建符号链接。 
        MKLINK [[/D] | [/H] | [/J]] Link Target
        /D 创建目录符号链接。默认为文件 符号链接。
        /H 创建硬链接，而不是符号链接。
        /J 创建目录联接。
        Link 指定新的符号链接名称。
        Target 指定新链接引用的路径 (相对或绝对)。
        mklink /D 某盘:\npm安装数据目录\node_modules（即npm install -g 全局安装的目录） 某盘:\项目文件夹\node_modules
