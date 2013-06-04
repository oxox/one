One!
=======

All-in-one Muramasa sword for front-end developer.
-------------------------------------------------

![One!](http://oxox.io/one/icon.png)

## 功能

- [x] ftp上传
- [x] tortoiseSVN调用
- [x] css合并压缩
- [ ] png无损压缩
- [ ] jpg无损压缩
- [ ] host功能-集成[hostspirit](http://faso.me/hostspirit/)
- [ ] sprite雪碧图生成

## 页面加载时的数据流程

1. dataSetting模块初始化 - 判断app.ini文件是否存在，不存在2，存在3
2. 创建app.ini文件
3. 触发window的dataSettingOnLoaded事件，如果2被成功执行，传递数据{isNew:true,isOk:true}，否则isNew为false
4. dataWorkspace模块监听window的dataSettingOnLoaded事件，如果isNew为true转5，否则6
5. 初始化SQLlite数据库，创建表Workspace，并且插入初始数据，
6. dataWorkspace模块触发window的dataWorkspaceOnDataInited事件

到了第6步，说明app.ini文件已经ok，sqlite数据库创建完毕，并且初始化数据完毕！

所以，所有页面的入口，应该监听window的dataWorkspaceOnDataInited事件，在事件处理函数中进行
页面逻辑处理。

## 模块关键接口

### J.base

1. J.base.reload - 重载当前窗口
2. J.base.showTip - 显示提示信息

	``` js

		/**
		 * 在页脚状态栏显示提示信息
		 * @param {String} txt 提示信息
		 * @param {int} timeout 提示显示时长
		 */
		pub.showTip = function(txt,timeout){
			clearTimeout(p.M.tipTimer);
			p.V.$tip.html(txt).show();
			p.M.isBusy=true;
			if (!timeout) {
				return;
			};
			p.M.tipTimer = setTimeout(function(){

				pub.hideTip();

			},timeout);
		};

	```
3. J.base.gui - referenced to 'nw.gui' module
4. J.base.fs - referenced to 'fs-extra' module

### J.home

1. J.home.addProject(_dir)

	``` js

		/**
		 * 添加一个工作项目
		 * @param {String} _dir 目录
		 */
		pub.addProject = function(_dir){
			p.project.addProject(_dir);
		};

	```