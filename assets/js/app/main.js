define([
    'jquery',
    'jquery.modernui',
    './base',
    './data',
    './view',
    './themepicker'
],function($,udf,B,D,V){

    var p = {},pub={};
    
    p.core={
        init:function(){
            //获取app列表
            D.getApps(function(err,d){
                if(err){
                    alert(err.toString());
                    return;
                }
                pub.appList = d;
                //console.log(d);
                p.core.render(d);
                p.core.initEvts();
            });
        },
        render:function(d){
            $('#widgetContainer').html(V.render('index',d));
        },
        initEvts:function(){
            $('#widget_scroll_container').modernui({
                widgetData:pub.appList.files,
                onShowExternal:function(widgetData){
                    // Open URL with default browser.
                    B.gui.Shell.openExternal(widgetData.url);
                }
            });
        }
    };

    B.$win.on(B.EVT.viewReady,function(e){
        p.core.init();
    });
    
    V.ready(function(err){
        if (err) {
            alert(err.toString());
            return;
        };
        //触发appOnViewReady事件
        B.$win.trigger(B.EVT.viewReady);
    });

});