/**
 * one.ini file module
 * @module Common
 * @class ini
 * @static
 * @author levinhuang
 * @requires J.base
 */
J(function($,p,pub){
    pub.id="ini";
    var initJson = J.base.session['ini'];
    if (initJson) {
        pub.data=JSON.parse(initJson);
        return;
    };
    if (!J.base.fs.existsSync(J.base.initFile)) {
        pub.data={
            "language":"zh-CN",
            "defaultLanguage":"en-US"
        };
        J.base.fs.mkdirsSync(J.base.dataRoot);
        J.base.fs.writeJsonSync(J.base.initFile,pub.data);
        J.base.session['ini']=JSON.stringify(pub.data);
        return;
    };

    pub.data = J.base.fs.readJsonSync(J.base.initFile);
    
});
