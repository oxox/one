J(function($,p,pub){
	pub.id = "file";
	pub.cache={};
	var cprocess = require('child_process');
	p.V={
		tplDetail:document.getElementById('tplFileDetail').innerHTML,
		$detail:$('#fileDetail'),
		$curFile:null,
		render:function(fileObj){
			if (this.$curFile) {
				this.$curFile.removeClass('active');
			};
			this.$curFile = $('#'+fileObj.id).addClass('active');
			document.getElementById('fileDetail').innerHTML = Mustache.render(this.tplDetail,fileObj);
			J.session[pub.id+'.curFileId'] = fileObj.id;
			J.home.setProjectTip(fileObj.path);
		},
		show:function(){
			J.home.showExtPanel('fileDetailBox');
			this.$detail.find('.eb_sec_ani').addClass('eb_sec_playani');
		}
	};
	p.C = {
		_init:function(){

			J.base.$win.on(J.dataProject.id+'OnGetFiles',function(e,d){
				if ( (!d.isOk) || d.cntFile===0 ) {
					return;
				};
				p.C.cacheFiles(d.files,d.cntFile);
				p.C.assertCurrentFile();
			}).on(J.home.id+'OnSelectProject',function(e,d){
				p.C.assertCurrentFile();
			});

			$("#projectPanelList").on('click','li',function(e){
				var id=this.getAttribute('data-id'),
					fileObj = J.file.cache[id];
				p.V.render(fileObj);
				p.V.show();
				return false;
			});

			$('#fileDetail').on('click','.btn_fopen',function(e){
				p.C.openFile(this.rel);
				return false;
			}).on('click','.btn_fedit',function(e){
				p.C.editFile(this.rel);
				return false;
			}).on('click','.btn_fopendir',function(e){
				J.base.openFileInFolder(this.rel);
				return false;
			});

		},//init
		openFile:function(filePath){
			//系统默认打开方式
			J.base.gui.Shell.openItem(filePath);
		},//openFile
		editFile:function(filePath){
			//获取配置的程序
			var exe = J.dataSetting.getExeByFile(filePath);
			if ( (!exe) || (exe.length==0) ) {
				if (!window.confirm(filePath+'\r\n文件编辑器没有设置哦亲！调用系统默认程序打开文件？')) {
					return;
				};
				this.openFile(filePath);
				return;
			};
			//reference:http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
			var child = cprocess.execFile(exe,[filePath],function(err,stdout,stderr){
				//console.info('stdout',stdout);
				//console.info('stderr',stderr);
				if (err!==null) {
					J.alert.show(err.toString());
				};
			});
			//console.info('child',child);
		},//editFile
		assertCurrentFile:function(){
			var fid = J.session[pub.id+'.curFileId'];
			if (!fid) {
				J.home.hideExtPanel();
				return;
			};
			var $f = $('#'+fid);
			if ($f.length===0) {
				J.home.hideExtPanel();
				return;
			};
			$f.trigger('click');

		},
		cacheFiles:function(files,len){
			for (var i = len - 1; i >= 0; i--) {
				pub.cache[files[i].id]=files[i];
			};
		}
	};

});