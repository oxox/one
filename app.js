
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var port = app.get('port'),
	defaultHost = '127.0.0.1',
	onListened = function(){
		var address = server.address().address;
		address = address==='0.0.0.0'?defaultHost:address;
		window.location.replace('http://'+address+':'+port);
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

module.exports= {
	self:app,
	server:server
};

