/**
 * view manager module
 * @module core
 * @class view
 * @static
 * @requires J.base,async,jade,path
 */
J(function($,p,pub){
    var x={
        id:'view'
    };
    
    var J.base = require('one.J.base'),
        J.ini = require('one.J.ini'),
        async = require('async'),
        jade = require('jade'),
        path = require('path');

    x.viewPath = J.base.appRoot+'assets\\views\\'+J.ini.language+'\\';
    x.defaultPath = J.base.appRoot+'assets\\views\\'+J.ini.defaultLanguage+'\\';
    x.view={};
    x.files={};

    x.ready = function(cbk){
        J.base.fs.readdir(x.viewPath,function(err,files){
            if (err) {
                return cbk(err);
            };
            var len = files.length;
            if (len===0) {
                return cbk('模板404！');
            };
            var fileNameList = [];
            for (var i = len - 1; i >= 0; i--) {
                files[i]=x.viewPath+files[i];
                fileNameList[i] = path.basename(files[i],'.jade');
            };
            //read all template files
            async.map(files,J.base.fs.readFile,function(err1,files1){
                if (err1) {
                    return cbk(err1);
                };
                for (var i = len - 1; i >= 0; i--) {
                    files1[i]={
                        "name":fileNameList[i],
                        "data":files1[i].toString()
                    };
                };
                x.files = files1;
                //compile all files
                async.each(files1,function(file2,cbk2){
                    try{
                        x.view[file2.name]=jade.compile(file2.data);
                        cbk2(null,file2);
                    }catch(e){
                        cbk2(e);
                    }
                },function(err3){
                    if (err3) {
                        return cbk(err3);
                    };
                    cbk.call(x,null)
                });
            });
        });
    };
    
    pub = x;
});