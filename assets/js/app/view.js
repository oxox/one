/**
 * view manager module
 * @module core
 * @class view
 * @static
 * @requires J.base,async,jade
 */
define(['jquery','./base'],function($,B){

    var pub = {};
    pub.id='view';
    
    var async = require('async'),
        jade = require('jade'),
        path = B.path;

    pub.viewPath = path.join(B.appRoot,'assets','views',B.iniData.language,path.sep);
    pub.defaultPath = path.join(B.appRoot,'assets','views'+B.iniData.defaultLanguage,path.sep);
    pub.view={};
    pub.files={};

    pub.ready = function(cbk){
        B.fs.readdir(pub.viewPath,function(err,files){
            if (err) {
                return cbk(err);
            };
            var len = files.length;
            if (len===0) {
                return cbk('模板404！');
            };
            var fileNameList = [];
            for (var i = len - 1; i >= 0; i--) {
                files[i]=pub.viewPath+files[i];
                fileNameList[i] = path.basename(files[i],'.jade');
            };
            //read all template files
            async.map(files,B.fs.readFile,function(err1,files1){
                if (err1) {
                    return cbk(err1);
                };
                for (var i = len - 1; i >= 0; i--) {
                    files1[i]={
                        "name":fileNameList[i],
                        "data":files1[i].toString()
                    };
                };
                pub.files = files1;
                //compile all files
                async.each(files1,function(file2,cbk2){
                        pub.view[file2.name]=jade.compile(file2.data);
                        //tell async that the iterator has completed!
                        cbk2();
                    
                },function(err3){
                    if (err3) {
                        return cbk(err3);
                    };
                    cbk.call(pub,null);
                });
            });
        });
    };
    
    pub.render = function(name,data){
        return pub.view[name](data);
    };
    return pub;
});
