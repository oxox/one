J(function($,p,pub){
	pub.id = "alert";
	p.V ={
		$main:$("#appAlert"),
		$body:$("#appAlertBody"),
		$title:$("#alertTitle")
	};

	p.M={
		defaultTitle:'Notice',
		duration:0,
		timer:null
	};
	p.C={
		_onLoad:function(){
			p.V.$main.modal({
				backdrop:'static',
				show:false
			}).on("hide",function(){
				clearTimeout(p.M.timer);
			});
		},
		show:function(txt,opts){
			
			if (!txt) {
				return;
			};

			opts = $.extend({},p.M,opts||{});
			opts.title = opts.title || p.M.defaultTitle;

			clearTimeout(p.M.timer);
			p.V.$body.html(txt);
			p.V.$title.html(opts.title);
			p.V.$main.modal("show");

			if (opts.duration) {
				p.M.timer = setTimeout(function(){
					p.C.close();
				},opts.duration);
			};

		},//show
		close:function(){
			p.V.$main.modal("hide");
		}
	};
	
	pub.show = function(txt,opts){
		p.C.show(txt,opts);
	};

	pub.hide = function(){
		p.C.hide();
	};
	
});