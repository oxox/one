var route = {
	_init:function(app){
		var fs = require('fs-extra');
		fs.readdirSync(__dirname).forEach(function(controllerName){
			var name = controllerName.replace('.js','');
			if (name==='bootup') {
				return;
			};
			var controller = require(__dirname+'/'+controllerName);
			if (!controller) {
				return;
			};
			//register routes manually according to the controller's _init method
			if (controller._init) {
				controller._init.call(controller,app);
				return;
			};
			//register routes automatically
			for(var actionName in controller ){
				var isHomePage = (name==='index');
				//home page
				if ( isHomePage && actionName==='index') {
					app.get('/',controller.index);
					continue;
				};
				//post verb
				if (actionName.indexOf('post')===0) {
					app.post('/'+(isHomePage ? actionName : (name+'/'+actionName) ),controller[actionName]);
					continue;
				};
				app.get('/'+(isHomePage ? actionName : (name+'/'+actionName) ),controller[actionName]);
			}//for

		});
	}
};

module.exports = function(app){
	route._init(app);
};