
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { 
		title: 'One!All-in-one Muramasa sword for front-end developer!',
		appData:{
			cnt:10
		},
		appName:'One!',
		year:new Date().getFullYear()
	});
};