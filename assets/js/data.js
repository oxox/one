J(function($,p,pub){
	pub.id = "data";
	/**
     * 获取app列表
     * @param {Function} cbk callback function
     */
    pub.getApps = function(cbk){
        J.base.getFiles({
            path:J.base.appRoot+'app\\',
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
                tempObj=null;
            for(var i =0;i<len;i++){
                tempObj = J.base.fs.readJsonSync(files[i].path);
                tempObj.window=tempObj.window||{};
                tempObj.window.icon=tempObj.window.icon||'icon.png';
                tempObj.urlRoot = files[i].urlRoot;
                tempObj.appUrl = J.base.isUrl(tempObj.main)?tempObj.main:(tempObj.urlRoot+tempObj.main);
                tempObj.icon = J.base.isUrl(tempObj.window.icon)?tempObj.window.icon:(tempObj.urlRoot+tempObj.window.icon);
                files[i].data = tempObj;
            };//for
            d.files=files;
            cbk(null,d);
        });
    };

});