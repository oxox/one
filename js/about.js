J(function($,p,pub){
	pub.id="about";
	var gui = require('nw.gui');
	
	p.C= {
		onLoad:function(){

			J.base.showTip('FWS V'+J.data.version);
			$("#txtVersion").html(J.data.version);

			$("#aboutBody").on("click","a",function(e){

				gui.Shell.openExternal(this.href);

				return false;

			});
		}
	};
	
});