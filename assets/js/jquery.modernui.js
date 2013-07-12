/**
 * jQuery.modernui.js
 * @author levin
 * @version 1.0.0
 */
(function($){
    var $win = $(window);
    /**
     * Internal core class for mordenui
     * @class modernui
     * @param {Object} $d jquery dom object for the pager
     * @param {Object} opts0 configuration options
     */
    var model = function ($d,opts0) {
        /**
         * pager's jquery dom object
         * @property $container
         * @type Object
         */
        this.$container = $d;
        /**
         * pager's configuration object
         * @property opts
         * @type Object
         * @default jQuery.fn.modernui.defaults
         */
        this.opts = opts0;
        this._init();
    };
    model.prototype = {
        _init: function () {
            
            this.window_width = 0;
            this.window_height = 0;
            this.$widget_sidebar = this.opts.cssWidgetSidebar.charAt(0)==='#'?
                                    $(this.opts.cssWidgetSidebar):
                                    this.$container.find(this.opts.cssWidgetSidebar);
            this.$widgets= this.$d.find(this.opts.cssWidget);
            this.$widget_containers= this.$container.find(this.opts.cssWidgetContainer);
            this.container_width = this.$container.width();
            this.is_touch_device= "ontouchstart" in document.documentElement ? true : false;
            this.title_prefix= this.opts.title_prefix;
            this._initEvt();
            
            this.widget_open= !1;
            this.dragging_x= 0;
            this.left= 60;
            this.widget_page_data= [];
            
            //preview module
            model.preview._init(this.opts);
            
        },
        _initEvt:function(){
            var me = this;
            this._onResize();
            $win.on('resize'+this.ns,function(e){
                me._onResize();
            }).on('popstate',function(e){
                if ( (!e.state) || (!e.state.url) ) {
                    return;
                }
                //TODO:open e.state.url
            });
           
        },
        _onResize:function(){
            this.window_width = $win.width();
            this.window_height = $win.height();
        },
        closeWidget:function(id){
            model.preview.close(id);
        },
        destroyWidget:function(id){
            model.preview.destroy(id);
        },
        openWidget : function(id){
            model.preview.show($('#'+id));
        },
        //update the options
        _update: function (opts,reInit) {
            this.opts = opts;
            if (reInit) {
                this._dispose()._init();
            }
        }
    };

    //preview模块
    model.preview = {
        suffix:'-preview',
        activeId:null,
        zIndex:1,
        cache:{},
        _init:function(opts){
            this.opts = opts;
            this.$dom = $(this.opts.cssWidgetPreview);
        },
        show:function($widget){
            var id = $widget[0].id,
                data = $widget.data();
            data.title = this.opts.title_prefix+data.name;
            if (data.target&&data.target==='_blank') {
                return window.open(data.url,"_blank");
            };
            
            if(this.activeId === id){
                return;
            };
            
            var css = {
                'background-color':$widget.css("background-color"),
                'background-image':$widget.css("background-image")
            };
            
            this.$dom.addClass('open')
                .css(css);
            
            if(this.cache[id]){
                return this.active(id);
            };
            
            model.history.set(data,true);
            
            //new preview
            this._loadWidget(data);
            this.cache[id]={
                $dom:$widget
            };
            this.active(id);
            
        },
        active:function(id){
            this.cache[id].$dom.css({
                'z-index':this.zIndex++
            });
            this.activeId = id;
        },
        close:function(widgetId){
            
        },
        destroy:function(widgetId){
            var id = this.getId(widgetId);
            $('#'+id).remove();
        },
        getId:function(widgetId){
            return (widgetId+this.suffix);
        },
        _loadWidget:function(widgetData){
            var d = b.data("name"),
                e = function(b) {
                    a.widget_preview.css("background-image", "none");
                    var c = $("#widget_preview_content");
                    c.length ? c.html(b) : c = $("<div>").attr("id", "widget_preview_content").insertAfter(a.widget_sidebar).html(b);
                    "true" !== j.getItem("melonhtml5_metro_ui_sidebar_first_time") && (a.widget_sidebar.addClass("open"), a.widget_sidebar.mouseenter(function() {
                        j.setItem("melonhtml5_metro_ui_sidebar_first_time", "true", Infinity);
                        $(this).removeClass("open")
                    }))
                },
                h = (new Date).getTime();
            a.widget_preview.children("div.dot").remove();
            for (var f = 1; 7 >= f; f++) $("<div>").addClass("dot").css("transition", "right " + (0.6 + f / 10).toFixed(1) + "s ease-out").prependTo(a.widget_preview);
            var g = function() {
                    var a = $("div.dot");
                    a.length && (a.toggleClass("open"), setTimeout(g, 1300))
                },
                k = function(b) {
                    var c = (new Date).getTime() - h;
                    1300 < c ? (a.widget_preview.children("div.dot").remove(), "undefined" !== typeof b && b()) : setTimeout(function() {
                        a.widget_preview.children("div.dot").remove();
                        "undefined" !== typeof b && b()
                    }, 1300 - c)
                };
            a.widget_preview.width();
            g();
            "undefined" === typeof c && (c = !0);
            c && void 0 !== a.widget_page_data[d] ? k(function() {
                e(a.widget_page_data[d])
            }) : (f = $.trim(b.data("url")), 0 < f.length && $.ajax({
                url: f,
                cache: !1,
                type: "POST",
                data: {},
                beforeSend: function() {},
                complete: function() {},
                error: function() {},
                success: function(b) {
                    k(function() {
                        a.widget_page_data[d] = b;
                        e(b)
                    })
                }
            }))
        }
    };

    //history模块
    model.history={
        set: function (stateObj,pushState) {
            this.value = stateObj;
            //更新state
            var m = pushState === true ? "pushState" : "replaceState";
            history[m](stateObj, stateObj.title||document.title, stateObj.url);
        },//set
        get: function () {
            return this.value;
        }
    };

    /**
     * This jQuery plugin displays pagination links inside the selected elements.
     * @module jQuery.fn.modernui
     * @author levinhuang
     * @version 1.0
     * @param {Object} opts Several options (see README for documentation)
     * @return {Object} jQuery Object
     */
    $.fn.modernui = function (opts) {


        // Set the options.
        var optsType = typeof (opts),
            opts1 = optsType !== 'string' ? $.extend(true, {}, $.fn.modernui.defaults, opts || {}) : $.fn.modernui.defaults,
            args = arguments;

        return this.each(function () {

            var $me = $(this),
                instance = $me.data("modernui");
            if (instance) {

                if (instance[opts]) {

                    instance[opts].apply(instance, Array.prototype.slice.call(args, 1));

                } else if (typeof (opts) === 'object' || !opts) {

                    instance._update.apply(instance, args);

                } else {
                    console.log('Method ' + opts + ' does not exist in jQuery.fn.modernui');
                }

            } else {
                $me.data("modernui", new model($me,opts1));
            }

        });
    };
    /**
    * default configuration
    * @property defaults
    * @type Object
    */
    $.fn.modernui.defaults = {
        cssWidget:'.widget',
        cssWidgetContainer:'.widget_container',
        cssWidgetPreview:'#widget_preview',
        cssWidgetSidebar:'#widget_sidebar',
        useIframe:true,
        title_prefix:'One - ',
        tplActiveLnk: '<li class="active%classes%"><a href="javascript://">%text%</a></li>',
        tplLnk: '<li class="%classes%"><a class="pg_item" data-pgidx="%curPage%" href="%linkTo%">%text%</a></li>',
        tplEllipse: '<li class="disabled"><a href="javascript://">%text%</a></li>'
    };
    
})(jQuery);
