define(function(){
    var initTray = function(B){
        // Reference to window and tray
        var win = B.gui.Window.get(),
            tray;

        // Get the minimize event
        win.on('minimize', function() {
            // Hide window
            this.hide();

            // Show tray
            tray = new B.gui.Tray({ 
                'icon': 'icon.png'
            });
            tray.tooltip = B.package.name+'-v'+B.package.version;
            // Show window and remove tray when clicked
            tray.on('click', function() {
                win.show();
                this.remove();
                tray = null;
            });
        });
    };//initTray

    return {'_init':initTray};
});