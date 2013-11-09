var path = require('path');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var ErrorHandlr = require('errorhandlr').engage()

app.configure(function(){
	app.set('port', process.env.PORT || 8000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, '/public')));
	app.use(ErrorHandlr.express());
});

app.get('/', function(req, res){
	res.render('index.jade');
});

app.post('/testPOST', function(req, res){
	res.header('Access-Control-Allow-Origin', "*");
	console.log(req.body);
	res.json({data: 'hello'});
});

server.listen(app.get('port'), function(){
	console.log("Listening on port " + app.get('port'));
});
