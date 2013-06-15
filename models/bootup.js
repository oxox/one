/**
 * site's base data api
 */
module.exports = function(app){
	var fs = require('fs-extra');
	app.locals.package = fs.readJsonSync('package.json');
};