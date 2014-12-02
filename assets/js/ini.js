// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/libs",
    "paths": {
        "jquery": "jquery-2.1.1.min",
        "rAF":"rAF",
        "../app/main":"../app/main-built"
    }
});

if(window.location.href.indexOf('debug')!==-1){
    requirejs.config({
        "paths":{
            "../app/main":"../app/main"
        }
    });
}

// Load the main app module to start the app
requirejs(["../app/main"]);
