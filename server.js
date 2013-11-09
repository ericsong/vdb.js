var mongoose = require('mongoose');
var path = require('path');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var ErrorHandlr = require('errorhandlr').engage()

var VdbDataSchema = mongoose.Schema({
	key: String,
	data: String
});

mongoose.connect('mongodb://localhost/vdb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('database connected');
});

var VdbDataModel = mongoose.model('VdbData', VdbDataSchema);

var uniqueIndex = 100000000000; 

VdbDataModel.find({}, function(err, query){
	console.log("Number of objects currently in db: " + query.length);
	uniqueIndex  = uniqueIndex + query.length;
});

app.configure(function(){
	app.set('port', process.env.PORT || 8000);
	app.set('address', process.env.ADDRESS || localhost);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, '/public')));
	app.use(ErrorHandlr.express());
});

app.get('/', function(req, res){
	res.render('index.jade');
});

app.post('/sendData', function(req, res){
	res.header('Access-Control-Allow-Origin', "*");
	var newKey  = uniqueIndex.toString(36);
	uniqueIndex++;

	var newData = new VdbDataModel;
	newData.key = newKey;
	newData.data = req.body.JSON;
	newData.save();
	console.log("Data received and stored");	

	var returnURL = 'http://' + app.get('address') + '/getData?key=' + newKey;
	res.json({visual_URL: returnURL});
});

app.get('/getData', function(req, res){
	console.log("request received for: " + req.query.key);

	VdbDataModel.find({key: req.query.key}, function(err, query){
		console.log(query[0].data);
		res.render('index.jade', {data: query[0].data});
	});
});

server.listen(app.get('port'), function(){
	console.log("Listening on port " + app.get('port'));
});
