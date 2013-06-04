//https://github.com/dannycoates/node-inspector
//simple merging test
var cssutil = require('../index');

// Force current directory
process.chdir(__dirname);

var opts = { minify: false };
cssutil.build([
    'file3.css'
], opts, function(e, css) {
    console.log(e);
    console.log(css);
});