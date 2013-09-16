/**
 * jQuery.modernui.js
 * @author levin
 * @version 1.0.0
 */
(function($){
    var $win = $(window),
        evtNamespace = ".ModernUI";
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
            this.$widgets= this.$container.find(this.opts.cssWidget);
            this.$widget_containers= this.$container.find(this.opts.cssWidgetContainer);
            this.container_width = this.$container.width();
            this.is_touch_device= !!("ontouchstart" in document.documentElement);
            this.title_prefix= this.opts.title_prefix;

            this._initEvt();
            
            this.widget_open= !1;
            this.dragging_x= 0;
            this.left= 60;

            this._animateWidgets();
            
            //preview module
            model.preview._init(this.opts);
            //sidebar module
            model.sidebar._init(this.$widget_sidebar,this.opts);
        },
        _animateWidgets:function(){
            //widget effect
            $('body').addClass("loaded");
            this.$widgets.each(function(i,o) {
                o = $(o);
                setTimeout(function() {
                    o.removeClass("unloaded");
                    setTimeout(function() {
                        o.removeClass("animation")
                    }, 300)
                }, 100 * i);
            });
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
                me.openWidget(e.state.id);
            });

            this.$container.on('click'+evtNamespace,this.opts.cssWidget,function(e){
                me.openWidget(this.id);
                return false;
            });
        },
        _onResize:function(){
            this.window_width = $win.width();
            this.window_height = $win.height();
        },
        closeWidget:function(){
            model.preview.close();
        },
        destroyWidget:function(id){
            model.preview.destroy(id);
        },
        openWidget : function(id){
            model.preview.show(id);
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
        suffix:'-detail',
        clLoading:'preview_loading',
        clLoaded:'preview_loaded',
        clHideHeader:'hide_hd',
        activeId:null,
        zIndex:1,
        cache:{},
        timer:null,
        _init:function(opts){
            var me = this;
            this.opts = opts;
            this.$dom = $(this.opts.cssWidgetPreview);
            this.$detailBox = $(this.opts.cssWidgetDetailBox);
            this.$loading = $(this.opts.cssWidgetLoading).modernloading({autoStart:false});
            this.$widget = null;
            this.$detailBox.on('mouseenter','.widget_detail_hd',function(e){
                if(me.opts.autoHideHeader){
                    me.showHeader();
                }
            }).on('mouseleave','.widget_detail_hd',function(e){
                if(me.opts.autoHideHeader){
                    me.hideHeader();
                }
            });
        },
        showLoading:function(css){
            this.$loading.modernloading('start');
            this.$dom.addClass('open '+this.clLoading)
                .css(css);
        },
        hideLoading:function(){
            this.$loading.modernloading('stop');
            this.$dom
                .removeClass(this.clLoading)
                .css({
                    'background-image':'none'
                });
        },
        hideHeader:function(){
            clearTimeout(this.timer);
            var me = this;
            this.timer = setTimeout(function(){
                me.$widget.addClass(me.clHideHeader);
            },this.opts.autoHideHeaderDelay);
        },
        showHeader:function(){
            clearTimeout(this.timer);
            this.$widget.removeClass(this.clHideHeader);
        },
        show:function(id){
            var $widget = $('#'+id),
                data = $widget.data();
            data.title = this.opts.title_prefix+data.name;
            data.id=id;
            if (data.target&&data.target==='_blank') {
                if(this.opts.onShowExternal){
                    return this.opts.onShowExternal.call(this,data);
                }
                return window.open(data.url,"_blank");
            };
            
            if(this.activeId === id){
                return;
            };
            
            var css = {
                'background-color':$widget.css("background-color"),
                'background-image':$widget.find('.main').css("background-image")
            };
            
            this.showLoading(css);
            
            if(this.cache[id]){
                return this.active(id);
            };
            
            model.history.set(data,true,this.opts.baseUrl);
            
            //new preview
            this._loadWidget(data,function(widgetData){
                $win.trigger('onWidgetLoaded'+evtNamespace,[widgetData]);
                model.preview.cache[widgetData.id]=widgetData;
                model.preview.active(widgetData.id);
            });
        },
        active:function(widgetId){
            this.activeId = widgetId;
            this.$widget = $('#'+this.getId(widgetId)).addClass('open');
            this.$dom.addClass(this.clLoaded);
            this.hideLoading();
            if(this.opts.autoHideHeader){
                this.hideHeader();
            }
        },
        close:function(){
            this.$widget.removeClass('open '+this.clHideHeader);
            this.$dom.removeClass('open '+this.clLoaded);
            clearTimeout(this.timer);
            this.activeId = null;
        },
        destroy:function(widgetId){
            var id = this.getId(widgetId);
            $('#'+id).remove();
            this.cache[widgetId]=null;
        },
        getId:function(widgetId){
            return (widgetId+this.suffix);
        },
        exists:function(widgetId){
            return ($('#'+this.getId(widgetId)).length>0);
        },
        refresh:function(){
            var id = this.activeId;
            this.close();
            this.destroy(id);
            this.show(id);
        },
        _loadWidget:function(widgetData,cbk){
            if(this.exists(widgetData.id)){
               cbk(widgetData);
                return;
            };

            $win.trigger('onWidgetLoading'+evtNamespace,[widgetData]);

            if(this.opts.previewInIframe){
                this.$detailBox.append($.fn.modernui.evalTpl(this.opts.tplWidgetDetail2,widgetData));
                $('#if_'+this.getId(widgetData.id)).on('load',function(e){
                    cbk(widgetData);
                });
                return;
            }
            var jqXhr = $.ajax({
                url:widgetData.url,
                cache:false,
                type:'GET'
            });
            jqXhr.always(function(xhr,txtStatus,err){
                //do  nothing
            }).done(function(data,txtStatus,xhr){
                model.preview.$detailBox.append(data);
                cbk(widgetData);
            }).fail(function(xhr,txtStatus,err){
                cbk(null,err);
            });
        }
    };

    //sidebar模块
    model.sidebar = {
        _init:function($dom,opts){
            this.$dom = $dom;
            this.opts=opts;
            this.$dom.on('click','.widget_sidebar_action',function(e){
                model.sidebar.action(this.getAttribute('data-action'));
            });
        },
        action:function(act){
            switch(act){
                case 'close':
                    model.preview.close();
                break;
                case 'refresh':
                    model.preview.refresh();
                break;
                case 'back':
                    alert('Not implemented!');
                break;
                case 'next':
                    alert('Not implemented!');
                break;
            }//switch
        }
    };

    //history模块
    model.history={
        set: function (stateObj,pushState,baseUrl) {
            this.value = stateObj;
            baseUrl = baseUrl||'';
            //更新state
            var m = pushState === true ? "pushState" : "replaceState";
            baseUrl = baseUrl.indexOf(stateObj.id)>0?baseUrl:(baseUrl+"#"+stateObj.id);
            history[m](stateObj, stateObj.title||document.title, baseUrl);
        },//set
        get: function () {
            return this.value;
        }
    };

    //switchlist bar
    model.switchlist = {
        _init:function(){

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
        cssWidgetDetailBox:'#widget_detail_box',
        cssWidgetSidebar:'#widget_sidebar',
        cssWidgetLoading:'#widget_loading',
        previewInIframe:true,
        autoHideHeader:true,
        autoHideHeaderDelay:2000,
        baseUrl:location.href,
        title_prefix:'One - ',
        tplWidgetDetail1:'<div id="%id%-detail" class="widget_detail">%html%</div>',
        tplWidgetDetail2:'<div id="%id%-detail" class="widget_detail"><div class="widget_detail_hd"><h1 class="widget_name">%name%</h1></div><div class="widget_detail_bd"><iframe id="if_%id%-detail" src="%url%" frameborder="0"></iframe></div></div>',
        tplWidgetThumb:'<div class="wthumb" style="background-image:url(../app/About/icon.png);"><a href="javascript:;" class="close">&times;</a></div>'
    };
    /**
     * simple template utility method
     * @param str template string
     * @param data template data
     * @returns {String}
     */
    $.fn.modernui.evalTpl = function (str, data) {
        var result;
        var patt = new RegExp("%([a-zA-z0-9]+)%");
        while ((result = patt.exec(str)) != null) {
            var v = data[result[1]] || '';
            str = str.replace(new RegExp(result[0], "g"), v);
        };
        return str;
    };
})(jQuery);
