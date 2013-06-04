/*
 * J.dataDir - 目录操作模块
 */
J(function($,p,pub){

	pub.id = "dataDir";

	var fs = J.base.fs,
		$win = $(window);

	p.isIgnoreDir = function(_dir,ignoreDirs){
		var yep = false,
			len = ignoreDirs.length;

		for (var i = len - 1; i >= 0; i--) {
			if( _dir.indexOf(ignoreDirs[i])>=0 ){
				yep = true;
				break;
			}
		};
		return yep;

	};

	p.getFiles = function(_dirObj,_opts){

		var _dir = _dirObj.path,
			_includeSubDir = _opts.includeSubDir||false,
			_ignoreDirs = _opts.ignoreDirs||[];

		if (p.isIgnoreDir(_dir,_ignoreDirs)) {
			return;
		};

		fs.exists(_dir,function(yes){
			if (!yes) {
				$win.trigger(pub.id+'OnGetFiles',[{
					isOk:false,
					'err':'Directory Not Exists:'+_dir,
					'errCode':1,
					'path':_dir,
					'dirObj':_dirObj
				}]);
				return;
			};

			fs.readdir(_dir,function(err,files){
				if (err) {
					$win.trigger(pub.id+'OnGetFiles',[{
						isOk:false,
						'err':err,
						'errCode':2,
						'path':_dir,
						'dirObj':_dirObj
					}]);
					return;
				};
				//console.log(files);
				var d = {
					isOk:true,
					path:_dir,
					files:[],
					folders:[],
					dirObj:_dirObj
				},stat = null,
					len2 = files.length;

				for (var i = len2 - 1; i >= 0; i--) {
					stat = fs.lstatSync(_dir+files[i]);
					//directory
					if (stat.isDirectory()) {

						//是否忽略的目录
						if ( p.isIgnoreDir(files[i],_ignoreDirs) ) {
							continue;
						};

						d.folders.push(_dir+files[i]+'\\');
						if (_includeSubDir) {
							p.getFiles({
								'flag':_dirObj.flag+'\\'+files[i],
								'path':(_dir+files[i]+'\\')
							},{
								includeSubDir:_includeSubDir,
								ignoreDirs:_ignoreDirs
							});
						};
						continue;
					};
					if (!stat.isFile()) {
						continue;
					};
					//file
					d.files.push({
						'path':(_dir+files[i]),
						'id':J.base.generateFileIdByFilePath(_dir+files[i]),
						'name':files[i],
						'dir':_dir,
						'stat':stat,
						'isImg':J.base.isImg(files[i]),
						'url':'file:///'+(_dir+files[i]).replace(/\\/gi,'/'),
						'size1':function(){
							return (this.size/1024).toFixed(2);
						},
						'mtime1':function(){
							return new Date(this.mtime.getTime()).toString('yyyy-MM-dd HH:mm:ss');
							//return this.mtime.getTime();
						}
					});
				};//for

				d.cntFile = d.files.length===0?false:d.files.length;

				$win.trigger(pub.id+'OnGetFiles',[d]);

			});//fs.readdir

		});//fs.exists

	};


	/*
	 * Get all files in specifed directory
	 * @param {Object} _dirObj directory object like {flag:'xxx',path:'E:\xxx\yyy\'}
	 * @param {Object} _opts configuration options. {includeSubDir:true|false,ignoreDirs:['.svn']}
	 */
	pub.getFiles = function(_dirObj,_opts){
		p.getFiles(_dirObj,_opts);
	};

});