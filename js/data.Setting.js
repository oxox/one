/**
 * application setting module
 */
J(function($,p,pub){
	pub.id="dataSetting";

	var fs = require('fs-extra'),
		path = require('path');

	p.M = {
		item0:{
			'exeCss':'',
			'exeImg':'',
			'exeLess':'',
			'exeHtml':'',
			//检索标志，用于获取项目文件时用
			//当路径出现/{searchFlag}0/时，同时检索/{searchFlag}x/下的文件
			'searchFlag':['img','html','css','less','psd','images'],
			//检索的文件扩展名
			'ext':['.jpg','.gif','.png','.html','.css','.less','.js'],
			'ignoreFolders':['.svn'],
			'createdAt':new Date().toString('yyyy-MM-dd HH:mm:ss'),
			'modifiedAt':new Date().toString('yyyy-MM-dd HH:mm:ss')
		}
	};

	pub.data = p.M.item0;

	//controller
	p.C = {
		init:function(){

			fs.exists(J.base.initFile,function(exists){

				if (!exists) {

					fs.mkdirs(J.base.dataRoot,function(err){
						if(err){
							console.log(err);
							$(window).trigger(pub.id+"OnLoaded",[{
								isOk:false,
								isNew:true
							}]);
							return;
						};
						fs.writeJson(J.base.initFile,pub.data,function(err){
							$(window).trigger(pub.id+"OnLoaded",[{
								isOk:true,
								isNew:true
							}]);
						});

					});
					

					return;
				};

				J.base.showTip('Load Config data...');

				fs.readJson(J.base.initFile,function(err,data){

					J.base.hideTip();

					if(err) {
						$(window).trigger(pub.id+"OnLoaded",[{
							'err':err
						}])
						return;
					}
					if (typeof(data.searchFlag)==='string') {
						data.searchFlag = data.searchFlag.split(',');
					};
					J.dataSetting.data = data;

					$(window).trigger(pub.id+"OnLoaded",[{isOk:true}]);

				});

			});
		}
	};
	/**
	 * 更新记录
	 */
	pub.save = function(item){
		
		item = $.extend({},pub.instance,item||{});

		fs.writeJson(J.base.initFile,item,function(err){
			if (err) {

				$(window).trigger(pub.id+"OnSavedError",[err]);
				return;
			};

			$(window).trigger(pub.id+"OnSaved",[item]);

			J.dataSetting.data = item;

		});
	};

	/**
	 * 根据文件获取配置的应用程序
	 * @param {String} filePath 文件路径
	 */
	pub.getExeByFile = function(filePath){
		var ext = J.base.getFileExt(filePath);
		ext = ext.toUpperCase();
		var exeStr = null,
			tempObj = null;
		for(var c in pub.data){
			if(c.indexOf('exe')!==0){
				continue;
			}
			tempObj = c.toUpperCase();
			if (tempObj.indexOf(ext)>0) {
				exeStr = pub.data[c];
			};
		}//for
		return exeStr;
	};
	
});