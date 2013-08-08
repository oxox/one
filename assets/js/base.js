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
	pub.gui = require('nw.gui');
    pub.userName = process.env['USERNAME'];
    pub.localdb = win0.localStorage||{};
    pub.session = win0.sessionStorage||{};
    pub.appRoot = __dirname.substr(0,__dirname.lastIndexOf('\\')+1);//process.execPath.substr(0,process.execPath.lastIndexOf('\\')+1);

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
	
	
	//https://github.com/rogerwang/node-webkit/wiki/Show-window-after-page-is-ready
	window.onload=function(){
		gui.Window.get().show();
	};

	p.C={
		_onLoad:function(){
			//minimize to tray
			this.initTray();

		},
		initTray:function(){
			// Reference to window and tray
			var win = gui.Window.get(),
				tray;

			// Get the minimize event
			win.on('minimize', function() {
				// Hide window
				this.hide();

				// Show tray
				tray = new gui.Tray({ 
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
});
