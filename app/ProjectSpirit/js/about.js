J(function($,p,pub){
	pub.id="about";
	var gui = require('nw.gui');
	
	p.C= {
		_onLoad:function(){

			J.base.showTip(J.data.packageJson.name+' V'+J.data.version);
			$("#txtVersion").html(J.data.version);

			$("#aboutBody").on("click","a",function(e){

				gui.Shell.openExternal(this.href);

				return false;

			});
		}
	};
	
});