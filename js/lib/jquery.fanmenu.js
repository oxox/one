/*!
  A jquery plugin mimicking the fan-menu EX of the Path App.
  @name jquery.fanmenu.js
  @author levinhuang (lv)
  @version 1.0.1
  @date 04/12/2013
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
;(function($) {

	var model = function($d,opts) {
		this.$d = $d;
		this.opts = opts;
		this.init();
	};

	model.prototype = {
		//event binding entry
		_initEvts:function(){
			var me = this;
			
			this.$toggle
				.off(this.opts.eventName+'.fanmenu')
				.on(this.opts.eventName+'.fanmenu',function(e){
			
					if(me.$d.hasClass(me.opts.clActive)){
						me.toggleFan(0);
					}else{
						me.toggleFan(1);
					}
					return false;
				});

			if (this.opts.hideOnClick) {
				$(document).off('click.fanmenu')
					.on('click.fanmenu',function(e){
						var $target = $(e.target);

						if ($target.is(me.$d)) {
							return;
						};

						if ( $target.hasClass(me.opts.hideOnClickExcept) || $target.parents('.'+me.opts.hideOnClickExcept).length>0 ) {
							return;
						};

						var	$tempWrap = $target.parents('.'+me.opts.clActive);
						if ($tempWrap.length>0) {
							return;
						};

						me.close();

					});
			};

		},
		init:function () {
		
			this.angle = 0;
			this.delayTime=0;
			this.eleAngle=[];
			this.xPos=[];
			this.yPos=[];
			
		
			//get elements
			this.$items = this.$d.find(this.opts.cssMenuItem);
			this.$toggle=this.$d.find(this.opts.cssMenuToggle);
			this.cntItem = this.$items.length;
			
			this.angle = this.opts.angleDisplay/(this.cntItem-1);
			this.delayTime = 1/(this.cntItem-1);
			
			this.initFanMenu();

			this._initEvts();
		},
		initFanMenu:function(){
			
			var me = this;
			
			this.$items.each(function(i,o){
				me.eleAngle[i] = (me.opts.initAngle + me.angle*i)*Math.PI/180;
				me.xPos[i] = (me.opts.radius * Math.sin(me.eleAngle[i]));
				me.yPos[i] = (me.opts.radius * Math.cos(me.eleAngle[i]));
				 
				var j = i;
				if (i<(me.cntItem/2)) {
					j = me.cntItem-1-i;
				};
				var rotateVal = 90-(me.opts.initAngle + me.angle*j);
				//var rotateVal = 90-me.eleAngle[i]*180/Math.PI;

				$(o).css({
					'-webkit-transform': 'rotate('+rotateVal+'deg)',
					   '-moz-transform': 'rotate('+rotateVal+'deg)',
						'-ms-transform': 'rotate('+rotateVal+'deg)',
						 '-o-transform': 'rotate('+rotateVal+'deg)',
							'transform': 'rotate('+rotateVal+'deg)'
				});
			});
			
		},
		toggleFan:function(flag){
			var me = this;
			this.$items.each(function(i,ele){
				$(ele).css({
				'left' : (flag==0)?0:me.xPos[i],
				'top' : (flag==0)?0:-me.yPos[i],
				});
			});
			
			if(flag==0){//close
				this.$d.removeClass(this.opts.clActive).addClass(this.opts.clDeactive);
				this.$toggle.removeClass(me.opts.clToggleEffect);
			}else{
				this.$d.removeClass(this.opts.clDeactive).addClass(this.opts.clActive);
				this.$toggle.addClass(me.opts.clToggleEffect);
			}
			
		},
		close:function(){
			this.toggleFan(0);
		},
		open:function(){
			this.toggleFan(1);
		},
		update:function(opts,reInit){
			this.opts = $.extend(this.opts,opts||{});
			if(reInit){
				this.init();
			}
		}//updateOpts
	};

	$.fn.fanmenu = function(opts) {
		// Set the options.
		var optsType = typeof(opts),
			opts1 = optsType!=='string'?$.extend(true,{}, $.fn.fanmenu.defaults, opts||{}):$.fn.fanmenu.defaults,
			args = arguments;
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function () {
			var $me = $(this),
				instance = $me.data("fanmenu");
			if(instance) {

				if(instance[opts]){
					
					instance[opts].apply(instance,Array.prototype.slice.call(args, 1));

				}else if (typeof(opts) === 'object' || !opts){
					
					instance.update.apply(instance,args);

				}else{
					console&&console.log('Method '+opts+' does not exist in jQuery.fanmenu');
				}

			}else {
				$me.data("fanmenu",new model($me, opts1));
			}
		});
	};

	$.fn.fanmenu.defaults = {
		eventName:'click',				//the event that trigger the menu to show
		hideOnClick:false,				//hide the menu when clicking the other places on the document
		hideOnClickExcept:'fm_antihide',//donot hide the menu when clicking on these elements with className 'fm_antihide'
		initAngle: 0,					//initial angle for the fan
		angleDisplay: 90,				//display angle of the fan
		radius:200,						//the radius of the fan
		clActive:'fm_active',
		clDeactive:'fm_off',
		clToggleEffect:'fm_rotate',
		cssMenuToggle:'.fm_btntoggle',
		cssMenuItem:'.fm_list>*'
	};

})(jQuery);