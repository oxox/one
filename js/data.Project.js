J(function($,p,pub){
	pub.id="dataProject";
	
	var fs = J.base.fs,
		path = require('path'),
		$win = J.base.$win;

	p.M={
		dataFile : J.base.dataRoot+'Project.json',
		items:[]//project items
	};

	p.C={
		//save a project instance
		save:function(d,isInit){

			var cnt = p.M.items.length;
			for (var i = 0; i < cnt; i++) {
				p.M.items[i].id = i+1;
			};

			if ( d && (!d.isDeleted) ) {
				d.id = cnt+1;
				p.M.items.push(d);
			};

			fs.writeJson(p.M.dataFile,p.M.items,function(err){
				var isOk =true;
				if (err) {
					isOk = false;
				};
				var data ={
					isOk:isOk,
					isInit:isInit,
					err:err,
					data:p.M.items,
					item:d
				};
				$win.trigger(pub.id+"OnSaved",[data]);

				//如果是初始化或者是有项目被删除，触发一次数据加载事件
				if (isInit||d.isDeleted) {
					$win.trigger(pub.id+"OnDataLoaded",[data]);
				};

			});
		},
		//remove a project
		remove:function(_dir){
			if (!pub.exists(_dir)) {
				return;
			};
			var items = [],
				len = p.M.items.length,
				d = null;

			for (var i =0;i<len; i++) {
				if(p.M.items[i].path===_dir){
					d = p.M.items[i];
					d.isDeleted=true;
				}else{
					items.push(p.M.items[i]);
				}
			};

			p.M.items = items;
			this.save(d,false);
		}
	};


	/**
	 * Add a directory as project
	 * @param {String} _dir directly
	 */
	pub.addDirAsProject=function(_dir){

		if (pub.exists(_dir)) {
			$win.trigger(pub.id+'OnSaved',[{isOk:false,err:'Project directory exists:'+_dir}]);
			return;
		};

		var tempDir = _dir;

		if (J.endsWidth(_dir,'\\')) {
			tempDir = tempDir.substr(0,tempDir.length-1);
		}else{
			_dir+='\\';
		};

		var d = {
			path:_dir
		};
		//get project name
		d.name = tempDir.substr(tempDir.lastIndexOf('\\')+1);
		//created at
		d.createdAt = new Date().toString('yyyy-MM-dd HH:mm:ss');

		p.C.save(d,false);

	};

	/**
	 * Whether a project exists
	 * @param {String} _dir project directory
	 */
	pub.exists = function(_dir){
		var yes = false,
			len = p.M.items.length;

		_dir = J.endsWidth(_dir,'\\')?_dir:(_dir+'\\');

		for (var i = len - 1; i >= 0; i--) {
			if (p.M.items[i].path==_dir) {
				yes=true;
				break;
			};
		};
		return yes;
	};

	/**
	 * Get all working projects
	 */
	pub.getAll = function(){
		var file =p.M.dataFile;
		fs.exists(file,function(exists){

			if (!exists) {

				p.C.save(null,true);

				return;
			};

			J.base.showTip('Load Project data...');

			fs.readJson(file,function(err,data){

				J.base.hideTip();

				if(err) {
					$win.trigger(pub.id+"OnDataLoaded",[{
						'isOk':false,
						'err':err
					}]);
					return;
				}

				p.M.items = data;

				$win.trigger(pub.id+"OnDataLoaded",[{'isOk':true,'data':data}]);

			});

		});
	};

	/**
	 * show projects in specified workspace
	 * @param {String} workspacePath workspace path
	 */
	pub.filterByWorkspace = function(workspacePath){

		if (!workspacePath) {
			return p.M.items;
		};

		var items = p.M.items,
			len = items.length,
			items1 = [];
		for (var i = 0; i < len; i++) {
			if (items[i].path.indexOf(workspacePath)==0) {
				items1.push(items[i]);
			};
		};
		return items1;
		
	};
	/**
	 * Get project files from specified project directory
	 * @param {String} _dir project directory
	 */
	pub.getFiles = function(_dir){

		var topFolders = [],
			projectType,//项目类型标识
			flags = J.dataSetting.data.searchFlag,
			flags1 = [],
			flagIndex = 0,
			flagFoundIndex =false,
			len1 = flags.length;

		//获取项目类型
		for (var i = len1 - 1; i >= 0; i--) {

			if ( (!flagFoundIndex) && ( flagIndex = _dir.indexOf('\\'+flags[i]+'\\') ) >0 ) {
				projectType=1;
				flagFoundIndex =i;
				topFolders.push({
					'flag':flags[i],
					'path':_dir
				});
			};
			if (i!==flagFoundIndex) {
				flags1.push(flags[i]);
			};
		};

		projectType = typeof(projectType)==='undefined'?2:1;

		//获取顶级搜索目录
		//1,对于按类型目录结构存放的项目-例如易迅...
		//搜索的目标路径格式为：E:/yyy/{searchFlag}/xxx/
		//2,对于普通按项目目录结构存放的项目
		//搜索的目标路径格式为：E:/yyy/xxx/{searchFlag}/
		var folderPrefix,folderSuffix;
		if (projectType==1) {
			folderPrefix = _dir.substr(0,flagIndex+1);
			folderSuffix = _dir.substr(flagIndex+1);
			folderSuffix = folderSuffix.substr(folderSuffix.indexOf('\\'));
			len1 = flags1.length;
			for (var i = len1 - 1; i >= 0; i--) {
				topFolders.push({
					'flag':flags1[i],
					'path':(folderPrefix+flags1[i]+folderSuffix)
				});
			};
		}else{
			//跟目录
			topFolders.push({
				'flag':'..',
				'path':_dir
			});
			/*
			//子目录
			for (var i = len1 - 1; i >= 0; i--) {
				topFolders.push({
					'flag':flags[i],
					'path':(_dir+flags[i]+'\\')
				});
			};
			*/
		};

		//read all files according to the J.dataSetting.data.searchFlag
		len1 = topFolders.length;
		for (var i = len1 - 1; i >= 0; i--) {
			J.dataDir.getFiles(topFolders[i],{
				includeSubDir:true,
				ignoreDirs:J.dataSetting.data.ignoreFolders
			});
		};

	};
	/**
	 * 根据项目的路径删除项目
	 * @param {String} _dir 项目目录
	 */
	pub.removeByDir = function(_dir){
		p.C.remove(_dir);
	};

});
