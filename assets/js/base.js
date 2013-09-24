//TODO:make it cool http://html5demos.com/history
/**
 * base utility module
 * @module Common
 * @class base
 * @static
 * @author levinhuang
 */
J(function($,p,pub){
	pub.id="base";
	var win0 = window;
	
	pub.fs = require('fs-extra');
	pub.path =require('path');
	pub.gui = require('nw.gui');
    pub.userName = process.env['USERNAME'];
    pub.localdb = win0.localStorage||{};
    pub.session = win0.sessionStorage||{};
    pub.appRoot = process.execPath.substr(0,process.execPath.lastIndexOf('\\')+1);
    pub.appRootUrl = 'file:///'+pub.appRoot.replace(/\\/gi,'/');

    //package json
    if ( !(pub.package=pub.session['package']) ) {
        pub.package = pub.fs.readJsonSync(pub.appRoot+'package.json');
        pub.session['package'] = JSON.stringify(pub.package);
    }else{
        pub.package = JSON.parse(pub.package);
    };

    pub.dataRoot = pub.appRoot+"data\\$\\".replace('$',pub.package.name);
    pub.initFile = pub.dataRoot+"app.ini";
    pub.$win = $(win0);
    pub.$body = $('body');
    
    //global event definition
    pub.EVT = {
        viewReady:'appOnViewReady'
    };
	
	
	//https://github.com/rogerwang/node-webkit/wiki/Show-window-after-page-is-ready
	window.onload=function(){
		pub.gui.Window.get().show();
	};

	p.C={
		_onLoad:function(){
			//minimize to tray
			this.initTray();

		},
		initTray:function(){
			// Reference to window and tray
			var win = pub.gui.Window.get(),
				tray;

			// Get the minimize event
			win.on('minimize', function() {
				// Hide window
				this.hide();

				// Show tray
				tray = new pub.gui.Tray({ 
					'icon': 'icon.png'
				});
				tray.tooltip = pub.package.name+'-v'+pub.package.version;
				// Show window and remove tray when clicked
				tray.on('click', function() {
					win.show();
					this.remove();
					tray = null;
				});
			});
		}//initTray
	};
	/**
	 * 字符串中是否包含指定的字符串
	 * @param {String} str 字符串
	 * @param {Array} searchingStrs 字符串数组
	 */
	pub.containsString = function(str,searchingStrs){
		var yep = false,
			len = searchingStrs.length;

		for (var i = len - 1; i >= 0; i--) {
			if( str.indexOf(searchingStrs[i])>=0 ){
				yep = true;
				break;
			}
		};
		return yep;

	};
	/**
	 * 获取文件的扩展名
	 * @param {String} filePath 文件路径
	 */
	pub.getFileExt = function(filePath){
		var ext = filePath.substr(filePath.lastIndexOf('.')+1);
		return ext;
	};
	/**
	 * 获取文件所在的根路径。支持e:/xx/xx.txt，也支持e:\xx\xx.txt
	 * @param {String} filePath 文件路径
	 */
	pub.getFileRootPath=function(filePath){
		var idx = ( idx=filePath.lastIndexOf('\\') )>=0?idx:filePath.lastIndexOf('/');
		if (idx<0) {
			return null;
		};
		filePath = filePath.substr(0,idx+1);
		return filePath;
	};
	/**
	 * 根据文件路径生成一个文件id
	 * @param {String} filePath 文件路径
	 */
	pub.generateFileIdByFilePath = function(filePath){
		filePath = filePath.replace(/\\/gi,'-').replace(/\//gi,'-').replace(/\./gi,'_').replace(/:/gi,'');
		return filePath;
	};

	/**
	* 指定的文件是否是图片
	* @public
	* @function
	* @name J.base#isImg
	* @param {String} file 文件路径
	*/
	pub.isImg = function(file) {
	    file = file.toLowerCase();
	    var isImg = false;
	    var arrImg = ['.jpg','.png','.gif','.jpeg'];
	    for (var i = 0; i < arrImg.length; i++) {
	        isImg = (file.substr(file.lastIndexOf(arrImg[i])) == arrImg[i]);
	        if (isImg) {
	            break;
	        }
	    }
	    return isImg;
	};
	/**
	 * 制定字符串是否是url格式的字符串
	 * @param {String} testStr 待检测的字符串
	 */
	pub.isUrl = function(testStr){
		return (testStr.indexOf('http://')===0||testStr.indexOf('file://')===0);
	};
	/**
	* 获取指定目录匹配正则表达式的文件
	* @public
	* @function
	* @name J.base#getFiles
	* @param {Object} _dirObj 目录路径,例如{fileflag:/xxx/gi,path:'E:\xxx\yyy\',level:1,folderFlag:null}
	* @param {Function} _cbk 回调函数
	*/
	pub.getFiles = function(_dirObj,_cbk){

		_dirObj = $.extend({},{
			fileFilter:null,//文件过滤正则表达式，null代表全部
			folderFilter:null,//文件夹过滤正则表达式,null代表全部
			level:0,//目录层级索引号：默认只搜索根目录
			curLevel:0,//当前目录搜索层级
			includeSubDir:true,
			ignoreFolders:[]
		},_dirObj||{});
		p.getFiles(_dirObj,_cbk);
	};

	//helper methods
	//Get files of specified path
	var _readFiles = function(dirObj,cbk){
		pub.fs.readdir(dirObj.path,function(err,files){
			if (err) {
				cbk(err,{
					'isOk':false,
					'err':err,
					'errCode':2,
					'path':dirObj.path
				});
				return;
			};
			//console.log(dirObj);
			var d = {
				'isOk':true,
				'path':dirObj.path,
				'fileFilter':dirObj.fileFilter,
				'folderFilter':dirObj.folderFilter,
				'files':[],
				'folders':[],
				'dirObj':dirObj
			},stat = null,
				len2 = files.length,
				folders1=[],
				tempFile;


			//分离目录和文件
			for (var i = 0; i <len2; i++) {
				stat = pub.fs.lstatSync(dirObj.path+files[i]);
				//directory
				if (stat.isDirectory()) {

					//是否忽略的目录
					if ( pub.containsString(files[i],dirObj.ignoreFolders) ) {
						continue;
					};
					if(dirObj.folderFilter!==null&&files[i].match(dirObj.folderFilter)===null){
						continue;
					}
					d.folders.push(dirObj.path+files[i]+'\\');
					folders1.push(dirObj.path+files[i]+'\\');
					continue;
				};
				if (!stat.isFile()) {
					continue;
				};
				//file filter
				if(dirObj.fileFilter!==null&&files[i].match(dirObj.fileFilter)===null){
					continue;
				};
				//file
				tempFile={
					'fileFilter':dirObj.fileFilter,
					'path':(dirObj.path+files[i]),
					'id':J.base.generateFileIdByFilePath(dirObj.path+files[i]),
					'name':files[i],
					'ext':pub.path.extname(files[i]).replace('.','').toLowerCase(),
					'dir':dirObj.path,
					'isImg':J.base.isImg(files[i]),
					'url':'file:///'+(dirObj.path+files[i]).replace(/\\/gi,'/'),
					'size':(stat.size/1024).toFixed(2),
					'mtime':new Date(stat.mtime.getTime()).toString('yyyy-MM-dd HH:mm:ss'),
					'ctime':new Date(stat.ctime.getTime()).toString('yyyy-MM-dd HH:mm:ss'),
					/*access time--is the time when the data of a file was last accessed*/
					'atime':new Date(stat.atime.getTime()).toString('yyyy-MM-dd HH:mm:ss')
				};
				tempFile.urlRoot = J.base.getFileRootPath(tempFile.url);
				d.files.push(tempFile);
			};//for

			if ( !dirObj.includeSubDir || (d.folders.length===0) ||(dirObj.curLevel===dirObj.level) ) {
				d.cntFile = d.files.length;
				cbk(null,d);
				return;
			};

			//子目录的递归读取
			var dirObj1= $.extend({},dirObj,{
				'path':folders1.splice(0,1)[0]
			}),cbk1 = function(err1,obj1){

				if (!err1) {
					d.files = d.files.concat(obj1.files);
				};

				if (folders1.length===0) {
					d.cntFile = d.files.length;
					cbk(null,d);
					return;
				};
				dirObj1.path = folders1.splice(0,1)[0];
				_readFiles(dirObj1,cbk1);

			};
			dirObj1.curLevel = dirObj.curLevel+1;
			_readFiles(dirObj1,cbk1);

		});//fs.readdir
	};
	//_readFiles
	p.getFiles = function(_dirObj,_cbk){

		var _dir = _dirObj.path,
			_includeSubDir = _dirObj.includeSubDir,
			_ignoreFolders = _dirObj.ignoreFolders;

		if (pub.containsString(_dir,_ignoreFolders)) {
			_cbk({
				'isOk':false,
				'err':_dir+'has been ignored!',
				'errCode':0,
				'path':_dir,
				'dirObj':_dirObj
			});
			return;
		};
		pub.fs.exists(_dir,function(yes){
			if (!yes) {
				var err0 = {
					'isOk':false,
					'err':'Directory Not Exists:'+_dir,
					'errCode':1,
					'path':_dir,
					'dirObj':_dirObj
				};
				_cbk(err0);
				return;
			};
			_readFiles(_dirObj,function(err,d){
				_cbk(err,d);
			});

		});//fs.exists

	};

});
