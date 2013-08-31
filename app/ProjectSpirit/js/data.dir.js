/*
 * J.dataDir - 目录操作模块
 */
J(function($,p,pub){

	pub.id = "dataDir";

	var fs = J.base.fs,
		path = require('path');

	p.isIgnoreDir = function(_dir,ignoreFolders){
		var yep = false,
			len = ignoreFolders.length;

		for (var i = len - 1; i >= 0; i--) {
			if( _dir.indexOf(ignoreFolders[i])>=0 ){
				yep = true;
				break;
			}
		};
		return yep;

	};

	//Get files of specified path
	p._getFiles = function(dirObj,cbk){
		fs.readdir(dirObj.path,function(err,files){
			if (err) {
				cbk(err,{
					'isOk':false,
					'err':err,
					'errCode':2,
					'path':dirObj.path
				});
				return;
			};
			//console.log(files);
			var d = {
				'isOk':true,
				'path':dirObj.path,
				'flag':dirObj.flag,
				'files':[],
				'folders':[],
				'folderFlags':[],
				'dirObj':dirObj
			},stat = null,
				len2 = files.length,
				folders1=[],
				folderFlags1=[];


			//分离目录和文件
			for (var i = 0; i <len2; i++) {
				stat = fs.lstatSync(dirObj.path+files[i]);
				//directory
				if (stat.isDirectory()) {

					//是否忽略的目录
					if ( p.isIgnoreDir(files[i],dirObj.ignoreFolders) ) {
						continue;
					};

					d.folders.push(dirObj.path+files[i]+'\\');
					d.folderFlags.push(dirObj.flag+'\\'+files[i]);
					folders1.push(dirObj.path+files[i]+'\\');
					folderFlags1.push(dirObj.flag+'\\'+files[i]);
					continue;
				};
				if (!stat.isFile()) {
					continue;
				};
				//file
				d.files.push({
					'flag':dirObj.flag,
					'path':(dirObj.path+files[i]),
					'id':J.base.generateFileIdByFilePath(dirObj.path+files[i]),
					'name':files[i],
					'ext':path.extname(files[i]).replace('.','').toLowerCase(),
					'dir':dirObj.path,
					'isImg':J.base.isImg(files[i]),
					'url':'file:///'+(dirObj.path+files[i]).replace(/\\/gi,'/'),
					'size':(stat.size/1024).toFixed(2),
					'mtime':new Date(stat.mtime.getTime()).toString('yyyy-MM-dd HH:mm:ss'),
					'ctime':new Date(stat.ctime.getTime()).toString('yyyy-MM-dd HH:mm:ss'),
					/*access time--is the time when the data of a file was last accessed*/
					'atime':new Date(stat.atime.getTime()).toString('yyyy-MM-dd HH:mm:ss')
				});
			};//for

			if ( !dirObj.includeSubDir || (d.folders.length===0) ) {
				d.cntFile = d.files.length;
				cbk(null,d);
				return;
			};

			//子目录的递归读取
			var dirObj1= $.extend({},dirObj,{
				'flag':folderFlags1.splice(0,1)[0],
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
				dirObj1.flag = folderFlags1.splice(0,1)[0];
				dirObj1.path = folders1.splice(0,1)[0];
				p._getFiles(dirObj1,cbk1);

			};
			p._getFiles(dirObj1,cbk1);

		});//fs.readdir
	};

	p.getFiles = function(_dirObj,_cbk){

		var _dir = _dirObj.path,
			_includeSubDir = _dirObj.includeSubDir||false,
			_ignoreFolders = _dirObj.ignoreFolders||[];

		if (p.isIgnoreDir(_dir,_ignoreFolders)) {
			_cbk({
				'isOk':false,
				'err':_dir+'has been ignored!',
				'errCode':0,
				'path':_dir,
				'dirObj':_dirObj
			});
			return;
		};

		fs.exists(_dir,function(yes){
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
			p._getFiles(_dirObj,function(err,d){
				_cbk(err,d);
			});

		});//fs.exists

	};
	/*
	 * Get all files in specifed directory
	 * @param {Object} _dirObj directory object like {flag:'xxx',path:'E:\xxx\yyy\'}
	 * @param {Function} _cbk callback function
	 */
	pub.getFiles = function(_dirObj,_cbk){
		p.getFiles(_dirObj,_cbk);
	};

	/**
	 * get the directory containing .svn or _svn folder
	 */
	pub.getSVNDir = function(_dir){
		//fs.existsSync();
		var test = function(flag){
			var dirParts = _dir.split('\\'),
				exists = false, 
				tempPath = null;
			while( (!exists) && (dirParts.length!==0) ){
				tempPath = dirParts.concat([flag]).join('\\');
				exists = fs.existsSync(tempPath);
				tempPath = dirParts.join('\\');
				dirParts.pop();
			}//while
			return ({'exists':exists,'path':tempPath});
		};

		var obj = test('.svn');
		if (obj.exists) {
			return obj.path;
		};
		obj = test('_svn');
		return (obj.exists?obj.path:null);
	};

});