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
//var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017';

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);


function getDateTime() {
	var now     = new Date();
	var day     = now.getDate();
	var hour    = now.getHours();
	var minute  = now.getMinutes();
	var second  = now.getSeconds();

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
	var dateTime = day + " " + hour+':'+minute+':'+second;
	return dateTime;
}


function printAve(){
	//need updated counting numbers
	//and sum of these temperatures
	average = (sum / validnum).toFixed(2);
	var Temp = "Average Temperature is " + average;
	console.log(Temp);
	for(var i = 0 ; i < 4; i++){
		if(flag_update[i] == 0){
			console.log("XBee " + (i+1) + " is not responding.");
			io.emit("chat message", "XBee " + (i+1) + " is not responding.");
		}
	}

	for(var i = 0; i < 4; i++){
		if(i == 1){
			data = tempArray[0];
			io.emit('1', data);

		}

		if(i == 2){
			data = tempArray[1];
			io.emit('2', data);

		}

		if(i == 3){
			data = tempArray[2];
			io.emit('3', data);

		}

		if(i == 4){
			data = tempArray[3];
			io.emit('4', data);

		}
	}




	/*for(var i = 0; i < 4; i++){
		console.log("XBee " + (i+1) + ": " + tempArray[i]);
	}*/
	flag_update = [0, 0, 0, 0];
	io.emit("chat message", Temp + " *C now");
	io.emit("average", average);
	var time = getDateTime();
	var ave = {
		"sensor_ID" : "average",
		"temperature": average,
		"unit": "*C",
		"time": time
	}

	var insertDocument = function(db, callback){
		db.collection('average').insertOne(ave, function(err, result){
			assert.equal(err, null);
			console.log("Inserted a document.");
			callback();
		});
	};
	MongoClient.connect(url, function(err, db){
		assert.equal(null, err);
		console.log("Connected correctly to server.");
		insertDocument(db, function(){
			db.close();
		});
	});

	sum = 0;
	validnum = 0;
	var t = setTimeout(function(){printAve()}, 2000);
}




app.get('/', function(req, res){
	res.sendfile('realTime_v3.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
	});
	socket.on('average', function(ave){
		io.emit('average', ave);
	});
	socket.on('1', function(data){
		io.emit('1', data);
	});
	socket.on('2', function(data){
		io.emit('2', data);
	});
	socket.on('3', function(data){
		io.emit('3', data);
	});
	socket.on('4', function(data){
		io.emit('4', data);
	});
	//socket.on('chat message', function(msg){
		//io.emit('chat message', msg);
		//sp.write(msg + "\n");
	//});
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

		var sensor_data = {
			"sensor_ID": message[0],
			"temperature" : message[1],
			"unit":"C",
			"time": time
		}

		var insertDocument = function(db, callback){
			db.collection('sensor').insertOne(sensor_data, function(err, result){
				assert.equal(err, null);
				console.log("Inserted a document.");
				callback(result);
			});
		};
		MongoClient.connect(url, function(err, db){
			assert.equal(null, err);
			console.log("Connected correctly to server.");
			insertDocument(db, function(){
				db.close();
			});
		});

	});
});
