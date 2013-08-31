//https://github.com/dannycoates/node-inspector
//compress using ycssmin
var cssutil = require('../index');

// Force current directory
process.chdir(__dirname);

var opts = { compressProviderId: 1 };
cssutil.build([
    'file1.css'
], opts, function(e, css) {
    console.log(e);
    console.log(css);
});