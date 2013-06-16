/**
 * site's base data api
 */
module.exports = function(app){
	var fs = require('fs-extra'),
		appData = {
			package:fs.readJsonSync('package.json'),
			userName:process.env['USERNAME'],
			appRoot:process.execPath.substr(0,process.execPath.lastIndexOf('\\')+1)
		};
	appData.dataRoot = appData.appRoot+"data\\$\\".replace('$',appData.package.name);

	app.locals(appData);
};