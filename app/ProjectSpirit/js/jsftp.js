/**
 * Ftp上传模块using jsftp
 */
J(function($,p,pub) {
	pub.id = 'ftpUpload';

	//require("jsftp")报Uncaught Error: Cannot find module 'jsftp'
	//原因：是nw.exe和页面不在一个目录，require的线程和nw是一起的
	//解决：在nw的目录也npm安装下。后面打包发布nw是和页面一起的，不会有此问题
	var jsftp = require("jsftp"),//require("./node_modules/jsftp/index.js"),
		cssutil = require('cssutil'),
		path = require('path'),
		UglifyJS = require("uglify-js"),
		ftps = {};

	p.M ={
		wsInfo:null,
		ftp:null,
		compressJS:true,
		compressCSS:true,
		keepUncompressedFile:true
	};

	p.V = {
		$main:$('#ftpUploadBox'),
		$fileList:$('#fileListUpload'),
		$btnFtpUpload:$('#btnFtpUpload'),
		$loading:$('#ftpUploadLoading'),
		$loadingBD:$('#ftpUploadLoadingBD'),
		tplFileItem:'<li id="ftpFile%id%" data-id="%id%" data-path="%path%" data-name="%name%">%name%</li>',
		_init:function(){
			this.$btnFtpUpload.on('click',function(e){
				if(this.className.indexOf('disabled')>0){
					alert('当前项目没有对应的FTP配置信息，请检查workspace配置！');
					return;
				}
				//FTP登录验证
				p.V.show();
				p.C.ftpAuth(function(){
					p.V.show(true);
				});
				
			});
			//retry
			$('#btnUpdRedo').on('click',function(e){
				var items = pub.getUploadedFiles();
				p.C.uploadAll(items);
			});
			//upload all
			$('#btnUpdAll').on('click',function(e){
				p.C.uploadAll(J.home.getFilesOfActiveProject());
			});
			//reset
			$('#btnUpdReset').on('click',function(e){
				p.V.$fileList.empty();
			});

			$('#ftpUploadBox .ipt_cbx').on('change',function(e){
				var id0 = this.getAttribute('data-id');
				p.M[id0] = $(this).is(':checked');
			});

			J.base.$win.on(J.home.id+'onProjectDeleted',function(e){
				p.V.$fileList.empty();
			});

		},
		show:function(tip){
			if (tip===true) {
				this.$loading.addClass('hide');
				return;
			};
			if (typeof(tip)==='string') {
				this.$loadingBD.addClass('error').html(tip);
				return;
			};
			this.$loadingBD.removeClass('error').html(this.$loadingBD.attr('data-tip'));
			J.home.showExtPanel('ftpUploadBox');
			this.$loading.removeClass('hide');
		},
		highlight:function(){
			this.$main.addClass('dragover');
		},
		unhighlight:function(){
			this.$main.removeClass('dragover');
		},
		assertUploadable:function(projectPath){
			var wsInfo = J.home.getWorkspaceByFilePath(projectPath);

			if (!wsInfo) {
				this.$btnFtpUpload.addClass('disabled');
			}else{
				this.$btnFtpUpload.removeClass('disabled');
			};
			p.M.wsInfo = wsInfo;
		},
		addFile:function(fileObj){
			var fileDom = document.getElementById('ftpFile'+fileObj.id);
			var fileStatus = {
				isOk:true
			};
			if (fileDom) {
				fileStatus.fileDom = fileDom;
				if(fileDom.getAttribute('data-uploading')==='1'){
					fileStatus.isOk = false;
				}
				return fileStatus;
			};

			this.$fileList.append(J.evalTpl(this.tplFileItem,fileObj,true));
			fileStatus.fileDom = document.getElementById('ftpFile'+fileObj.id);
			return fileStatus;
		},
		updateFileAttr:function(fileDom,attrObj){
			for(var c in attrObj){
				fileDom.setAttribute(c,attrObj[c]);
			};
		}
	};
	//controller
	p.C={
		_init:function(){
			J.base.$win.on(J.home.id+'OnSelectProject',function(e,d){
				p.V.assertUploadable(d.path);
			});
		},
		_ftpPut:function(buffer,remotePath,fileStatus,opts){
			var ftp = p.M.ftp;
			//传文件
			ftp.put('/'+remotePath, buffer, function(err1, res1) {
				if (err1) {
					opts.always({
						'isOk':false
					},{
						'target':fileStatus.fileDom,
						'attrs':{
							'class':"file_err",
							'data-uploading':'0',
							'title':'上传文件失败：'+err1.toString()
						}
					});
					return; 
				};

				//上传成功
				opts.always({
					'isOk':true
				},{
					'target':fileStatus.fileDom,
					'attrs':{
						'class':"file_ok",
						'data-uploading':'0',
						'title':''
					}
				});
				//关闭ftp会话
				/*
				ftp.raw.quit(function(err2,res2){
					if (err2) {
						throw err2;
					};
					console.log(res2);
				});
				*/

			});
		},
		_doUpload:function(fileInfo,remotePath,fileStatus,opts){

			//fileInfo is text string
			if(!J.base.fs.existsSync(fileInfo)){
				p.C._ftpPut(new Buffer(fileInfo),remotePath,fileStatus,opts);
				return;
			}

			//fileInfo is a physical file
			//S-传送文件
			J.base.fs.readFile(fileInfo, "binary", function(err, data) {
				if (!err) {
					p.C._ftpPut(new Buffer(data, "binary"),remotePath,fileStatus,opts);
					return;
				};
				//读取文件失败
				opts.always({
					'isOk':false
				},{
					'target':fileStatus.fileDom,
					'attrs':{
						'class':"file_err",
						'data-uploading':'0',
						'title':'读取文件失败：'+err.toString()
					}
				});
				
			});
			//E-传送文件
		},
		_compressJs:function(filePath,cbk){
			var filePath1 = filePath.toLowerCase();
			//文件后缀是.min.js或者用户选择不压缩
			if ( filePath1.indexOf('.min.js')>0 || (!p.M.compressJS) ) {
				cbk(null,[
					{
						'fileInfo':filePath,
						'remotePath':p.C._getRemotePath(filePath)
					}
				]);
				return;
			};

			var fileParts = filePath.split('\\'),
					len = fileParts.length,
					fileName = fileParts[len-1],
					fileName1 = fileName.substr(0,fileName.lastIndexOf('.'))+'.full.js';
			fileParts[len-1] = fileName1;

			var fullPath = fileParts.join('\\'),
				finalFiles = [
					{
						'fileInfo':UglifyJS.minify(filePath).code,
						'remotePath':p.C._getRemotePath(filePath)
					}
				];

			if (p.M.keepUncompressedFile) {
				finalFiles.push({
					'fileInfo':filePath,
					'remotePath':p.C._getRemotePath(fullPath)
				});
			};

			cbk(null,finalFiles);

		},
		//css合并压缩并上传
		_compressCss:function(filePath,cbk){
			var filePath1 = filePath.toLowerCase();
			//文件后缀是.min.css或者用户选择不压缩
			if ( filePath1.indexOf('.min.css')>0 || (!p.M.compressCSS) ) {
				cbk(null,[
					{
						'fileInfo':filePath,
						'remotePath':p.C._getRemotePath(filePath)
					}
				]);
				return;
			};
			var cssCompressorProviderId = 1;//1-ycssmin;0-clean-css
			cssutil.build([filePath],{
				minify:false,
				compressProviderId:cssCompressorProviderId
			},function(err,txt){
				if (err) {
					//TODO:LOG
					cbk(null,[
						{
							'fileInfo':filePath,
							'remotePath':p.C._getRemotePath(filePath)
						}
					]);
					return;
				};
				var fileParts = filePath.split('\\'),
					len = fileParts.length,
					fileName = fileParts[len-1],
					fileName1 = fileName.substr(0,fileName.lastIndexOf('.'))+'.full.css';
				fileParts[len-1] = fileName1;

				var fullPath = fileParts.join('\\'),
					finalFiles = [
						{
							'fileInfo':cssutil.compress(txt,cssCompressorProviderId),
							'remotePath':p.C._getRemotePath(filePath)
						}
					];

				if (p.M.keepUncompressedFile) {
					finalFiles.push({
						'fileInfo':txt,
						'remotePath':p.C._getRemotePath(fullPath)
					});
				};

				cbk(null,finalFiles);

			});
		},
		_getRemotePath : function(localPath,ext){
			var filePart = localPath.replace(p.M.wsInfo.rootPath,"").replace(/\\/gi,"/"),
				filePart1 = filePart.substr(0,filePart.lastIndexOf('.'));
			if (!ext) {
				filePart = p.M.wsInfo.remotePath+filePart;
			}else{
				filePart = p.M.wsInfo.remotePath+filePart1+ext;
			};
			return filePart;
			
		},
		_prepareUpload:function(fileObj,opts){
			var fileStatus = p.V.addFile(fileObj);
			opts = $.extend({'always':function(){}},opts||{});
			if (!fileStatus.isOk) {
				//TODO:LOG
				opts.always(fileStatus);
				return;
			};

			//获取该文件的远端路径
			var remotePath = this._getRemotePath(fileObj.path);

			p.V.updateFileAttr(fileStatus.fileDom,{'data-uploading':'1'});

			var remoteFolder=J.base.getFileRootPath(remotePath),
				fileExt = path.extname(fileObj.path).toLowerCase();
			//创建远程ftp目录
			this.mkd(remoteFolder,'',function(msg){
				
				if (!msg.isOk) {
					//创建目录时错误
					opts.always(msg,{
						'target':fileStatus.fileDom,
						'attrs':{
							'class':"file_err",
							'data-uploading':'0',
							'title':'创建ftp目录时错误：'+remoteFolder+"|"+msg.err.toString()
						}
					});
					return;
				};
				//目录没有创建完毕
				if(!msg.isDone){
					return;
				}

				var onCompressed = function(err,fileInfos){
					if (err) {
						fileInfos = [{
							'fileInfo':fileObj.path,
							'remotePath':remotePath
						}];
					};
					opts.always0 = opts.always;
					opts.always = function(msg,data){
						if (fileInfos.length===0) {
							opts.always0(msg,data);
							return;
						};
						var tempFile1 = fileInfos.splice(0,1)[0];
						p.C._doUpload(tempFile1.fileInfo,tempFile1.remotePath,fileStatus,opts);
					};
					var tempFile = fileInfos.splice(0,1)[0];
					p.C._doUpload(tempFile.fileInfo,tempFile.remotePath,fileStatus,opts);
				};

				//目录创建完毕
				switch(fileExt){
					case '.css':
						p.C._compressCss(fileObj.path,onCompressed);
						break;
					case '.js':
						p.C._compressJs(fileObj.path,onCompressed);
						break;
					default:
						p.C._doUpload(fileObj.path,remotePath,fileStatus,opts);
						break;
				};
			});
		},//doUpload
		uploadFile:function(fileObj,opts){

			this._prepareUpload(fileObj,opts);

		},
		uploadAll:function(files){
			var len = files.length;
			if (len===0) {
				return;
			};
			p.progress.show();
			var opts={
				'always':function(msg,data){
					if (data.target) {
						p.V.updateFileAttr(data.target,data.attrs);
					};
					//进度条
					//递归
					var len1 = files.length,
						pval = (len-len1)/len;
					p.progress.update( pval );
					if(len1>0){
						p.C.uploadFile(files.splice(0,1)[0],opts);
					}else{
						p.progress.update('Done!',true);
						p.progress.hide(800);
					};
					
				}//always
			};

			this.uploadFile(files.splice(0,1)[0],opts);

		},
		ftpAuth:function(cbk){
			var wsInfo = p.M.wsInfo;
			if (!wsInfo) {
				alert('当前项目没有对应的FTP配置信息，请检查workspace配置！');
				return;
			};

			var ftp = ftps[(wsInfo.ftpId+wsInfo.ftpUser)];
			if (!ftp) {
				ftps[(wsInfo.ftpId+wsInfo.ftpUser)]=ftp=new jsftp({
					host:wsInfo.ftpId,
					port:wsInfo.ftpPort,
					onError:function(err){
						p.V.show(err.toString());
						ftp.destroy();
						delete ftps[(wsInfo.ftpId+wsInfo.ftpUser)];
					}
				});
			};
			//authenticate the user
			if (ftp.authenticated) {
				cbk&&cbk();
			}else{
				ftp.auth(wsInfo.ftpUser,wsInfo.ftpPwd,function(err,res){
					p.M.ftp = ftp;
					if (err) {
						J.alert.show(err.toString());
						J.base.log(err);
						J.base.log(res);
						return;
					};
					cbk&&cbk();
				});
			}
		},//ftpAuth
		//递归创建目录
		mkd:function(remoteFolder,rootPath,cbk){

			if (remoteFolder===null||remoteFolder==='/') {
				//ftp根目录，不需要创建
				cbk({
					isOk:true,
					dir:null
				});
				return;
			};

			var folderParts = remoteFolder.split('/'),
				len = folderParts.length;

			if (folderParts[len-1]==='') {
				folderParts.splice(len-1);
			};
			rootPath = rootPath||'';
			rootPath = rootPath+'/'+folderParts.splice(0,1);
			this.mkdSingle(rootPath,function(msg){
				if (!msg.isOk) {
					cbk(msg);
					return;
				};
				//所有目录创建完毕
				if (folderParts.length===0) {
					msg.isDone=true;
					cbk(msg);
					return;
				};

				p.C.mkd(folderParts.join('/'),rootPath,cbk);

			});
			
		},//mkd
		mkdSingle:function(_dir,cbk){
			//test current working directory
			p.M.ftp.raw.cwd(_dir,function(err,res){
				if(!err){
					//目录已存在
					cbk({
						isOk:true,
						dir:_dir
					});
					return;
				}
				p.M.ftp.raw.mkd(_dir,function(err0,res0){
					if (err0) {
						//创建目录失败
						cbk({
							isOk:false,
							err:err0,
							dir:_dir
						});
						return;
					};
					//创建目录成功
					cbk({
						isOk:true,
						dir:_dir
					});
				});
			});
			
		}//mkdSingle
	};

	//进度条子模块
	p.progress={
		timer:null,
		$d:$('#ftpupdProgress'),
		$bd:$('#ftpupdProgressBD'),
		$bg:$('#ftpupdProgressBG'),
		update:function(n,force){
			if (force) {
				this.$bd.html(n);
				return;
			};
			var v = (n*100).toFixed(2)+'%';
			console.log(v);
			this.$bd.html(v);
			this.$bg.css({
				'width':v
			});
		},
		show:function(){
			clearTimeout(this.timer);
			this.$d.show();
			//触发事件ftpUploadOnUploading
			J.base.$win.trigger(pub.id+'OnUploading');
		},
		hide:function(delay){
			if (typeof(delay)==='undefined') {
				this._doHide();
				return;
			};
			this.timer = setTimeout(function(){
				p.progress._doHide();
			},delay||500);
			
		},
		_doHide:function(){
			this.$d.hide();
			this.update(0);
			J.base.$win.trigger(pub.id+'OnUploaded');
		}
	};

	/**
	 *文件拖拽回调
	 */
	pub.onDragStart = function(e){
		e.dataTransfer.setData('id',e.target.getAttribute('data-id'));
	};
	/**
	 * 文件拖拽结束后的回调
	 */
	pub.onDragEnd = function(e){
		p.V.unhighlight();
	};
	/**
	 * 拖拽划过时的回调
	 */
	pub.onDragOver = function(e){
		p.V.highlight();
		e.preventDefault();
	};
	/**
	 * 拖拽结束-开始传ftp
	 */
	pub.onDrop = function(e){
		e.preventDefault();
		var id = e.dataTransfer.getData('id');
		p.C.uploadAll([J.file.cache[id]]);
	};
	/**
	 * 获取已上传文件
	 */
	pub.getUploadedFiles = function(){
		var items = [];

		p.V.$fileList.find('li').each(function(i,o){
			items.push({
				'id':o.getAttribute('data-id'),
				'path':o.getAttribute('data-path'),
				'name':o.getAttribute('data-name')
			});
		});

		return items;
	};

});