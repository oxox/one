J(function($,p,pub){
    pub.id = "themepicker";
    
    p.V = {
        _init:function(){
            J.base.$win.on(J.base.EVT.viewReady,function(e){
                p.V.render();
            });
            
        },
        $curTheme:null,
        _initEvt:function(){
            $('#themePicker').on('click','#themepickerToggle',function(e){
                J.base.$body.toggleClass('themepicker_active');
            }).on('click','.theme',function(e){
                
                if(p.V.$curTheme.is(this)){
                    return;
                }
                var clOn = 'selected';
                p.V.$curTheme.removeClass(clOn);
                J.base.$body.removeClassByPrefix('theme-')
                    .addClass(this.getAttribute('data-name'));
                p.V.$curTheme = $(this).addClass(clOn);
            });
            
        },
        render:function(){
            J.base.$body.append(J.view.render(pub.id));
            this.$curTheme = $('#themePicker').find('.theme:eq(0)');
            this._initEvt();
        }
    };
    
});
