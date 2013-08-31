J(function($,p,pub){
	pub.id="editorWorkspace";
	
	p.V={
		$main:$("#workspaceEditor"),
		$title:$("#editorTitle"),
		$controlGroups:null,
		_onLoad:function(){
			this.$fields = this.$main.find('.field_item');
			this.$controlGroups = this.$main.find('.control-group');
			//文件夹路径
			$("#ipt_rootPath1").on("change",function(e){
				if (this.value.length>0) {
					document.getElementById(this.getAttribute('data-target')).value = this.value;
				};
			});

			//监听事件
			var id = J.dataWorkspace.id;
			$(window).on(id+'OnInserted',function(e,d){
				location.reload();
			}).on(id+'OnInsertedError',function(e,d){
				J.alert.show('WebSQL增加记录时发生错误！');
				J.base.hideTip();
				console.log(d);
			}).on(id+'OnUpdated',function(e,d){
				location.reload();
			}).on(id+'OnUpdatedError',function(e,d){
				J.alert.show('WebSQL更新时发生错误！');
				J.base.hideTip();
				console.log(d);
			}).on(id+'OnDeletedById',function(e,d){
				$("#wsitem"+d).remove();
				pub.hide();
			}).on(id+'OnDeletedByIdError',function(e,err){
				J.alert.show('WebSQL删除记录时发生错误！');
				J.base.hideTip();
				console.log(d);
			});

		},
		render:function(data,opts){
			this.$title.html(opts.title);
			this.$main.modal("show");

			if (!data) {
				return;
			};

			var $tempItem=null;

			for (var c in data) {
				this.$fields.filter('.field_'+c).val(data[c]);
			};

			if(!p.M.isNew){
				$("#btnDelete").show();
			}

		},
		reset:function(){
			this.$title.html(p.M.defaultTitle);
			this.$fields.each(function(i,o){
				$(o).val('');
			});
			$("#btnDelete").hide();
		},
		getData:function(){
			var data = {};
			this.$fields.each(function(i,o){
				data[o.name] = $.trim($(o).val());
			});

			return data;
		},
		resetValidation:function(){
			this.$controlGroups.removeClass('error');
		},
		validateError:function(fieldName){
			this.$controlGroups.filter('#cg_'+fieldName).addClass('error');
		}
	};
	p.M={
		regexInt:/^[0-9]+$/,
		regexName:/^[a-zA-Z0-9_\-]+$/,//alpha,number,underline,dashline
		regexCName:/^[a-zA-Z0-9_\u4e00-\u9fa5-\-]+$/,
		regexPartialUrl:/^[a-zA-Z0-9_\-\/]+$/,
		regexIpV4:/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/,
		defaultTitle:'Add Workspace',
		editTitle:'Edit Workspace-',
		duration:0,
		timer:null
	};
	p.C={
		_onLoad:function(){
			p.V.$main.modal({
				backdrop:'static',
				show:false
			}).on("hide",function(){
				clearTimeout(p.M.timer);
				p.C.reset();
			});

			$("#btnSave").on('click',function(e){
				p.C.save();
			});

			$("#btnNew").on("click",function(e){
				J.editorWorkspace.show("",{isNew:true});
			});

			$("#btnDelete").on('click',function(e){
				p.C.remove();
			});

		},
		remove:function(){
			if (!p.M.item) {
				return;
			};
			J.dataWorkspace.deleteById(p.M.item.id);
		},
		save:function(){
			//get data 
			var data = p.V.getData();
			
			p.V.resetValidation();

			if (!this.validate(data)) {
				return;
			};

			J.base.showTip('Saving Workspace'+data.name);

			if (p.M.isNew) {
                // 删除id字段 by Enix
                data.id = null; 
                delete data.id ;

				J.dataWorkspace.findByRootPath(data.rootPath,function(results){

					if(results.rows.length!==0){
						//工作空间已经存在
						J.alert.show('工作空间已经存在：'+data.rootPath);
						return;
					}
					//新增记录
					J.dataWorkspace.insert(data);

				});

				return;
			};

			//更新现有的工作空间
			J.dataWorkspace.update(data);

		},
		validate:function(data){
			//validate data.name
			var isNameValid = p.M.regexCName.test(data.name);
			if (!isNameValid) {
				J.alert.show('工作空间名称必须由"字母,数字,中文,下划线和中划线组成!',{title:'Invalid Field Entry!'});
				p.V.validateError('name');
				return false;
			};

			//validate data.rootPath
			if (data.rootPath.length==0) {
				J.alert.show('请选择工作空间对应的本地目录！');
				p.V.validateError('rootPath');
				return false;
			};
			if (!J.endsWidth(data.rootPath,'\\')) {
				data.rootPath+='\\';
			};

            // remove by enix
			// data.id = data.rootPath.replace(/\\/gi,'-').replace(':','').toLowerCase();

			//validate data.remotePath:字母数字和斜杠
			if (data.remotePath.length!=0) {
				if(!p.M.regexPartialUrl.test(data.remotePath)){
					J.alert.show('远程路径无效，请参考"static/icson/"输入！');
					p.V.validateError('remotePath');
					return false;
				}
				//补全末尾的斜杠
				if (!J.endsWidth(data.remotePath,'/')) {
					data.remotePath+='/';
				};
				if(data.remotePath[0]=="/"){ //删除开头的斜杠
					data.remotePath = data.remotePath.substr(1);
				};
			};

			//validate data.ftpId
			if (!p.M.regexIpV4.test(data.ftpId)) {
				J.alert.show('ftp id无效！');
				p.V.validateError('ftpId');
				return false;
			};

			//validate data.ftpPort
			if (!p.M.regexInt.test(data.ftpPort)) {
				J.alert.show('ftp端口无效！');
				p.V.validateError('ftpPort');
				return false;
			};

			//validate data.ftpUser & data.ftpPwd
			if (data.ftpUser.length==0) {
				p.V.validateError('ftpUser');
				return false;
			};
			if (data.ftpPwd.length == 0) {
				p.V.validateError('ftpPwd');
				return false;
			};
			return true;
		},
		show:function(item,opts){
			
			opts = $.extend({},p.M,opts||{});
			opts.title = opts.title || p.M.defaultTitle;
			p.M.isNew = opts.isNew;
			p.M.item = item;
			clearTimeout(p.M.timer);
			
			p.V.render(item,opts);

			if (opts.duration) {
				p.M.timer = setTimeout(function(){
					p.C.close();
				},opts.duration);
			};

		},//show
		showEdit:function(id){

			J.dataWorkspace.findById(id,function(results){

				if(results.rows.length==0){
					//工作空间不存在
					J.alert.show('工作空间不存在：'+id);
					return;
				}
				
				var item = results.rows.item(0);

				pub.show(item,{
					title:p.M.editTitle+item.name,
					isNew:false
				});

			});

		},
		reset:function(){
			p.V.reset();
		},
		close:function(){
			p.V.$main.modal("hide");
		}
	};
	
	pub.show = function(item,opts){
		p.C.show(item,opts);
	};

	pub.showEdit = function(id){

		p.C.showEdit(id);

	};

	pub.hide = function(){
		p.C.close();
	};
});
