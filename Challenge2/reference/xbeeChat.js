var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var message;

var flag_start = 0;
var validnum = 0;
var average = 0;
var sum = 0;
var flag_update = [0, 0 ,0 ,0];
var tempArray = [0, 0, 0, 0];//assuming there are at most 4 xbees

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/challenge2';

//get current time 
//format: year/month/data time
function getDateTime() {
	var now     = new Date(); 
	var year    = now.getFullYear();
	var month   = now.getMonth()+1; 
	var day     = now.getDate();
	var hour    = now.getHours();
	var minute  = now.getMinutes();
	var second  = now.getSeconds(); 

	if(month.toString().length == 1) {
		var month = '0'+month;
	}
	if(day.toString().length == 1) {
		var day = '0'+day;
	}   
	if(hour.toString().length == 1) {
		var hour = '0'+hour;
	}
	if(minute.toString().length == 1) {
		var minute = '0'+minute;
	}
	if(second.toString().length == 1) {
		var second = '0'+second;
	}   
	var dateTime = year + "/" + month+ "/" + day + " " + hour+':'+minute+':'+second;   
	return dateTime;
}

//print average temperature every 2 seconds
function printAve(){
	//need updated counting numbers
	//and sum of these temperatures
	if(validnum == 0){
		average = 0;
		io.emit("chat message", "No XBee is working right now.");
	}
	else{
		average = (sum / validnum).toFixed(2);
	}
	var Temp = "Temperature is " + average;
	console.log(Temp);
	for(var i = 0 ; i < 4; i++){
		if(flag_update[i] == 0){
			console.log("XBee " + (i+1) + " is not responding.");
			io.emit("chat message", "XBee " + (i+1) + " is not responding.");
		}
	}
	for(var i = 0; i < 4; i++){
		console.log("XBee " + (i+1) + ": " + tempArray[i]);
	}
	flag_update = [0, 0, 0, 0]; 
	io.emit("chat message", Temp + " *C now");

	var timeNow = getDateTime();
		var ave = {
			"sensor_id" : "average",
			"temperature" : average,
			"unit" : "*C",
			"time" : timeNow
		}

	var insertDocument = function(db, callback) {
			db.collection('average').insertOne(ave, function(err, result){
				assert.equal(err, null);
				//console.log("Inserted a document into the challenge2 collection.")
				callback();
			});
		}

		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			insertDocument(db, function() {
				db.close();
			});
		});
	sum = 0;
	validnum = 0;
	var t = setTimeout(function(){printAve()}, 2000);
}

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
	});
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
		sp.write(msg + "\n");
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

sp.on("open", function () {
	console.log('open');
	sp.on('data', function(data) {
		flag_start ++;
		message = data.split(':'); //separate data

		var id = parseInt(message[0]);
		if(id >= 1 && id <= 4){
			tempArray[id - 1] = parseFloat(message[1]);
			sum += tempArray[id - 1];

			if(flag_update[id - 1] == 0){
				flag_update[id - 1] = 1;//0->1 updated
				validnum++;
			}
		}
		else{
			console.log("Exceptions from XBees");
		}

		if(flag_start == 1){
			var t = setTimeout(function(){printAve()}, 2000);
		}
		flag_start = 2;

		var time = getDateTime();
		var sensor = {
			"sensor_id" : message[0],
			"temperature" : message[1],
			"unit" : "*C",
			"time" : time
		}

		var collection = 'Temp_' + id;
		var insertDocument = function(db, callback) {
			db.collection(collection).insertOne(sensor, function(err, result){
				assert.equal(err, null);
				//console.log("Inserted a document into the challenge2 collection.")
				callback();
			});
		}

		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			insertDocument(db, function() {
				db.close();
			});
		});
	});
});

