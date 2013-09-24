J(function($,p,pub){
    pub.id='app';
    
    p.core={
        init:function(){
            //获取app列表
            J.data.getApps(function(err,d){
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
            $('#widgetContainer').html(J.view.render('index',d));
        },
        initEvts:function(){
            $('#widget_scroll_container').modernui({
                widgetData:pub.appList.files,
                onShowExternal:function(widgetData){
                    // Open URL with default browser.
                    J.base.gui.Shell.openExternal(widgetData.url);
                }
            });
        }
    };
    pub._init = function(){
        
        J.base.$win.on(J.base.EVT.viewReady,function(e){
            p.core.init();
        });
        
        J.view.ready(function(err){
            if (err) {
                alert(err.toString());
                return;
            };
            //触发appOnViewReady事件
            J.base.$win.trigger(J.base.EVT.viewReady);
        });
    };
    
    
});
J.init();
