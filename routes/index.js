module.exports = {
	index:function(req,res){
		res.render('index', { 
			title: res.app.locals.package.description,
			appData:{
				cnt:10
			},
			year:new Date().getFullYear()
		});
	},
	about:function(req,res){
		res.send("about:respond with a resource");
	}
};