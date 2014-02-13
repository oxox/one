// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/libs",
    "paths": {
        "app": "../app",
        "jquery": "jquery-2.1.0.min",
        "rAF":"rAF"
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);