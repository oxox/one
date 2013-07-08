global.$=jQuery;

$(function(){

	var vm = require('one.viewmanager');
	vm.ready(function(err){
		if (err) {
			alert(err.toString());
			return;
		};
		console.log(this);
	});
	
});