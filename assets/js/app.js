J(function($,p,pub){
    pub.id='app';
    
    var init = function(){
        $('#widget_scroll_container').modernui({
            onShowExternal:function(widgetData){
                // Open URL with default browser.
                J.base.gui.Shell.openExternal(widgetData.url);
            }
        });
    };
    pub._init = function(){
        
        J.base.$win.on(J.base.EVT.viewReady,function(e){
            init();
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
