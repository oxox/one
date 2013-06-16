var http = require('http'),
	_self = {
		start:function(app){
			var port = app.get('port'),
				defaultHost = '127.0.0.1',
				//C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
				nodemonDebugApp = 'E:\\Camp\\Documents\\GitHub\\mamboer\\nwapp\\nw\\nw.exe',
				onListened = function(){
					var address = server.address().address;
					address = address==='0.0.0.0'?defaultHost:address;
					if (typeof(window) === 'undefined' ) {
						//running in nodemon
						//reference:http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
						var child = require('child_process').execFile(nodemonDebugApp,['--url=http://'+address+':'+port],function(err,stdout,stderr){
							console.log('stdout:'+stdout);
							console.log('stdin:'+stderr);
							if (err!==null) {
								console.log('error:'+err);
							};
						});
					}else{
						//running in node-webkit
						window.location.replace('http://'+address+':'+port);
					};
				},
				server = http.createServer(app).listen(port, onListened ),
				tryCnt = 0;

			server.on('error',function(e){

				if (e.code == 'EADDRINUSE') {
					if (tryCnt===3) {
						return;
					};
					tryCnt++;
					console.log('Address in use, retrying...');
					server.close(function(){
						server.listen(port, onListened);
					});
				}
			});
		}//start
	};

module.exports = _self;