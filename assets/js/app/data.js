define(['jquery','./base'],function($,B){
    var p = {},pub={};

	pub.id = "data";
	/**
     * 获取app列表
     * @param {Function} cbk callback function
     */
    pub.getApps = function(cbk){
        B.getFiles({
            path:B.appRoot+'app\\',
            level:1,
            fileFilter:/package.json/,
            ignoreFolders:['.git']
        },function(err,d){
            if (err) {
                cbk(err);
                return;
            };
            var files = d.files,
                len = files.length,
                tempObj=null,
                defaultIcon = B.appRootUrl+'assets/img/nologo.png';
            for(var i =0;i<len;i++){
                tempObj = B.fs.readJsonSync(files[i].path);
                tempObj.window=tempObj.window||{};
                tempObj.window.icon=tempObj.window.icon||defaultIcon;
                tempObj.urlRoot = files[i].urlRoot;
                tempObj.appUrl = B.isUrl(tempObj.main)?tempObj.main:(tempObj.urlRoot+tempObj.main);
                if(B.isUrl(tempObj.window.icon)){
                    tempObj.icon = tempObj.window.icon;
                }else{
                    tempObj.icon = tempObj.urlRoot+tempObj.window.icon;
                }
                files[i].data = tempObj;
            };//for
            d.files=files;
            cbk(null,d);
        });
    };

    return pub;

});