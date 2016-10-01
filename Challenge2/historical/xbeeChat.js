var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
//io(<port>) creates a http server for you
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
//  mongodb:// is the protocal definition
// localhost:27017 is the server we are connecting to
// challenge2 is the database we wish to connect to
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
	//var dateTime = year + "/" + month+ "/" + day + " " + hour+':'+minute+':'+second;   
	var dateTime = hour+':'+minute+':'+second;   
	
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
			//console.log("XBee " + (i+1) + " is not responding.");
			io.emit("chat message", "XBee " + (i+1) + " is not responding.");
		}
	}
	for(var i = 0; i < 4; i++){
		//console.log("XBee " + (i+1) + ": " + tempArray[i]);
	}
	flag_update = [0, 0, 0, 0]; 
	io.emit("chat message", Temp + " *C now");

	var timeNow = getDateTime();
	var ave_date = new Date();
	var ave = {
		"sensor_id" : "average",
		"temperature" : average,
		"unit" : "*C",
		"cal_time" : ave_date.getTime(),
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

// app.get('/', function(req, res){
// 	res.sendfile('index.html');
// });

app.get('/', function(req, res){
	res.sendfile('historical.html');
});

// io.on('connection', function(socket){
// 	console.log('a user connected');
// 	socket.on('disconnect', function(){
// 	});
// 	socket.on('chat message', function(msg){
// 		io.emit('chat message', msg);
// 		sp.write(msg + "\n");
// 	});
// });

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
		var sensor_date = new Date();
		var sensor = {
			"sensor_id" : message[0],
			"temperature" : message[1],
			"unit" : "*C",
			"cal_time" : sensor_date.getTime(),
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

		//Create a new MongoClient instance.
		//Connect to the Server
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			insertDocument(db, function() {
				db.close();
			});
		});
	});
});

//Sending and receiving events
io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
	});
	//this is a private message
	socket.on('historical', function(msg){
		var str = null;
		console.log("Time interval from user: " + msg);

		var findDocuments = function(db, callback) {
			//string = {0-->id, 1-->starttime(yy/mm/dd/hh/mm), 2-->endtime}
			var string = msg.split(",");
			var date = new Date()
			//get date and represent as string
			// console.log(date.toLocaleString());
			// console.log("starttime = " + string[1]);

			var  starttime = string[1].split("/");
			var  endtime = string[2].split("/");

   			var startstring = "20" + starttime[0] + "-" + starttime[1] + "-" + starttime[2] + " " + starttime[3] + ":" + starttime[4] + ":00";
   			var endstring = "20" + endtime[0] + "-" + endtime[1] + "-" + endtime[2] + " " + endtime[3] + ":" + endtime[4] + ":00";
   			var timestamp1 = Date.parse(new Date(startstring));
   			var timestamp2 = Date.parse(new Date(endstring));
   			// console.log("starstring = " + startstring);
   			// console.log("endstring = " + endstring);
   			// console.log("After parse 1: " +timestamp1);
   			// console.log("After parse 2: " +timestamp2);

   			var query1 = '{\"sensor_id\":string[0]}';
   			var query2 = '{\"sensor_id\":string[0],\"cal_time\":{$gt:timestamp1,$lt:timestamp2}}';
   			if(string[1] != "" && string[2] != ""){
   				var cursor = db.collection('average').find({"sensor_id":string[0],"cal_time":{$gt:timestamp1,$lt:timestamp2}});
   			}
   			else{
   				var cursor =db.collection('average').find({"sensor_id":string[0]});
   			}

   			cursor.each(function(err, doc) {
   				assert.equal(err, null);
   				if (doc != null) {
   					var d = new Date(parseInt(doc.cal_time));
   					str = str + d.getFullYear()+"/"+ (d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"," + doc.temperature+"\n";
   					socket.emit('average_draw',str);

   				} else {
   					callback();
   				}
   			});

   		};

   		MongoClient.connect(url, function(err, db) {
   			assert.equal(null, err);
   			findDocuments(db, function() {
   				db.close();
   			});
   		});
   	});
});