J(function($,p,pub){
	pub.id="editorProject";
    var fs = require('fs');
	
	p.V={
		$main:$("#projectEditor"),
		$title:$("#editorTitle"),
		$controlGroups:null,
		_onLoad:function(){
			this.$fields = this.$main.find('.field_item');
			this.$controlGroups = this.$main.find('.control-group');

			//监听事件
			var id = J.dataProject.id;
			J.base.$win.on(id+'OnSaved',function(e,d){
				/* 暂时注释：不知道这里刷新页面的意义 lv @ 05/30
				if(!d.isOk){
					return;
				}
				if (!d.item) {
					return;
				};
				if (!d.isDeleted) {
					location.reload();
				};
				*/
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
		regexPartialUrl:/^[a-zA-Z0-9\/]+$/,
		defaultTitle:'Add Project',
		editTitle:'Edit Project-',
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

            $("#btnCreateFolder").on("click",function(e){
                p.C.show('', {isNew:true});
            });

			$("#btnSave").on('click',function(e){
				p.C.save();
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

			J.base.showTip('Saving Project '+data.name);

            var fullPath = data.rootPath + data.name + '\\'; 
			if (p.M.isNew) {
                fs.exists(fullPath, function (ret) {
                    if (ret) {
                        J.alert.show('Project已经存在：'+ fullPath);
                        return;
                    }
                    // 记录数据
                    J.dataProject.addDirAsProject(fullPath);
                });
			};

            //create dirs
            var dirs = J.data.createDirs({'rootPath': data.rootPath, 'name': data.name});

            // create init file
            J.data.createInitFile({'rootPath': data.rootPath, 'name': data.name});
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
