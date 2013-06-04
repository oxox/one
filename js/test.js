//https://github.com/dannycoates/node-inspector
//simple merging test
var cssutil = require('cssutil');

var opts = { minify: true };
cssutil.build([
    'E:\\Camp\\Documents\\GitHub\\nwapp\\fwspace\\css\\test.css'
], opts, function(e, css) {
    console.log(e);
    console.log(css);
});