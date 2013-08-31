/**
 * tortoisesvn功能模块
 */
J(function($,p,pub) {
	pub.id = 'svn';

	var cprocess = require('child_process'),
		exec = cprocess.exec;

	p.svn={
		processFlag:'TSVNCache.exe',
		processName:'TortoiseProc',
		isReady:false,
		curProject:null,
		//断言svn是否可用
		assert:function(cbk){
			exec('tasklist', function(err, stdout, stderr) {
				if (err) {
					console.log(err);
					cbk({
						isOk:false,
						err:err
					});
					return;
				};
				// stdout is a string containing the output of the command.
				// parse it and look for the apache and mysql processes.
				if (stdout.indexOf(p.svn.processFlag)>=0) {
					p.svn.isReady = true;
					cbk({
						isOk:true
					});
					return;
				};

				//用户没有装tsvn
				cbk({
					isOk:false,
					err:'没有找到TortoiseSVN的进程信息！'
				});
			});
		},
		initView:function(){
			if(!this.isReady){
				$('#btnGroupSVN').addClass('hide');
				return;
			}

			$('#svnOPList').on('click','a',function(e){
				p.svn.invoke(this.rel);
				$('#btnGroupSVN').removeClass('open');
				return false;
			});
		},
		_init:function(){

			//监听home模块的事件，以便获取当前激活的项目
			J.base.$win.on(J.home.id+'OnSelectProject',function(e,d){
				p.svn.curProject = d;
			});

			this.assert(function(d){
				if (!d.isOk) {
					return;
				};
				p.svn.initView();
			});

		},
		//TortoiseSVN Commands
		//http://tortoisesvn.net/docs/release/TortoiseSVN_en/tsvn-automation.html#tsvn-automation-basics
		// @param {String} cmdName 命令
		// @param {String} 当前路径
		cmd:function(cmdName,cwd){

			var cmdTxt = this.processName+' /command:'+cmdName;
			if (cwd) {
				cmdTxt+=' /path:'+cwd;
			};
			//console.log('tsvn.cmd:=>'+cmdTxt);

			exec(cmdTxt,function(err,stdout,stdout){
				if (err !== null) {
					console.log(err);
				}
			});

		},
		invoke:function(flag){

			if (!this.curProject||this.curProject.path==='') {
				J.alert.show('没有选中任何项目！');
				return;
			};
			var _path = J.dataDir.getSVNDir(this.curProject.path);

			if (!_path) {
				J.alert.show('无SVN元信息！请确认该目录在使用svn进行版本管理！');
				return;
			};

			//获取该项目的所有文件
			var files = J.home.getFilesOfActiveProject(),
				filePaths =[],
				len = files.length;
			for (var i = 0; i < len; i++) {
				filePaths.push(files[i].path);
			};

			switch(flag){
				case '1':
					_path = len>0?filePaths.join('*'):_path;
					this.cmd('commit',_path);
					break;
				case '2':
					_path = len>0?filePaths.join('*'):_path;
					this.cmd('update',_path);
					break;
				case '3':
					this.cmd('log',_path);
					break;
				default:
					break;
			};//switch
		}
	};//p.svn

});