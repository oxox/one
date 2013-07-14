global.$=jQuery;

$(function(){
    // Load native UI library.
    var gui = require('nw.gui');


    var init = function(){
        $('#widget_scroll_container').modernui({
            onShowExternal:function(widgetData){
                // Open URL with default browser.
                gui.Shell.openExternal(widgetData.url);
            }
        });
    };

	var vm = require('one.viewmanager');
	vm.ready(function(err){
		if (err) {
			alert(err.toString());
			return;
		};
        init();
	});
	
});