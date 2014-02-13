define(['jquery','./base','./view','jquery.removeClassByPrefix'],function($,B,V){

    var p ={},pub={};
    pub.id = "themepicker";
    
    p.V = {
        _init:function(){
            B.$win.on(B.EVT.viewReady,function(e){
                p.V.render();
            });
            
        },
        $curTheme:null,
        _initEvt:function(){
            $('#themePicker').on('click','#themepickerToggle',function(e){
                B.$body.toggleClass('themepicker_active');
            }).on('click','.theme',function(e){
                
                if(p.V.$curTheme.is(this)){
                    return;
                }
                var clOn = 'selected';
                p.V.$curTheme.removeClass(clOn);
                B.$body.removeClassByPrefix('theme-')
                    .addClass(this.getAttribute('data-name'));
                p.V.$curTheme = $(this).addClass(clOn);
            });
            
        },
        render:function(){
            B.$body.append(V.render(pub.id));
            this.$curTheme = $('#themePicker').find('.theme:eq(0)');
            this._initEvt();
        }
    };

    p.V._init();

    return pub;
    
});
