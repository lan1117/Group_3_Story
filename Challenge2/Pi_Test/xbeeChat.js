var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
//io(<port>) creates a http server for you
var io = require('socket.io')(http);
var message;

var flag_start = 0;
var flag_err = 0;
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
		io.emit('warning', "No XBee is working right now. Please check!");
	}
	else{
		average = (sum / validnum).toFixed(2);
	}
	var Temp = "Temperature is " + average;
	console.log(Temp);
	var xbee = "";
	for(var i = 0 ; i < 4; i++){
		if(flag_update[i] == 0){
			xbee += "XBee" + (i + 1) + "  ";
			console.log(xbee + " is not responding.");
			io.emit('warning', xbee + " is not responding.");
		}
	}
	if(flag_update[0]==1 && flag_update[1]==1 && flag_update[2]==1 && flag_update[3]==1 ){
		io.emit('warning', "No warning right now.");
	}

	for(var i = 0; i < 4; i++){
		if(i == 0){
			data = tempArray[0];
			io.emit('1', data);
		}

		if(i == 1){
			data = tempArray[1];
			io.emit('2', data);
		}

		if(i == 2){
			data = tempArray[2];
			io.emit('3', data);
		}

		if(i == 3){
			data = tempArray[3];
			io.emit('4', data);
		}
	}

	flag_update = [0, 0, 0, 0]; 

	io.emit("average", average);

	var timeNow = getDateTime();
	var ave_date = new Date();
	var ave = {
		"sensor_ID" : "average",
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

app.get('/', function(req, res){
	res.sendfile('realTime.html');
});

app.get('/historical', function(req, res){
	res.sendfile('historical.html');
})

app.get('/realtime', function(req, res){
	res.sendfile('realTime.html');
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
		var sensor_date = new Date();
		var sensor = {
			"sensor_ID" : message[0],
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
	//for real-time
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

	//for historical
	socket.on('historical', function(msg){
		var str = null;
		var flag_doc = 0;;
		console.log("Time interval from user: " + msg);

		var findDocuments = function(db, callback) {
			//string = {0-->collection, 1-->starttime(yy/mm/dd/hh/mm), 2-->endtime, 3-->id}
			var string = msg.split(",");

			var  starttime = string[1].split("/");
			var  endtime = string[2].split("/");

   			var startstring = "20" + starttime[0] + "-" + starttime[1] + "-" + starttime[2] + " " + starttime[3] + ":" + starttime[4] + ":00";
   			var endstring = "20" + endtime[0] + "-" + endtime[1] + "-" + endtime[2] + " " + endtime[3] + ":" + endtime[4] + ":00";
   			var timestamp1 = Date.parse(new Date(startstring));
   			var timestamp2 = Date.parse(new Date(endstring));
   			console.log("starstring = " + startstring);
   			console.log("endstring = " + endstring);
   			console.log("After parse 1: " +timestamp1);
   			console.log("After parse 2: " +timestamp2);

   			
   			if(string[1] != "" && string[2] != ""){
   				var cursor = db.collection(string[0]).find({"sensor_ID":string[3],"cal_time":{$gt:timestamp1,$lt:timestamp2}});
   			}
   			else{
   				var cursor =db.collection(string[0]).find({"sensor_ID":string[3]});
   			}

   			cursor.each(function(err, doc) {
   				assert.equal(err, null);
   				if (doc != null) {
   					flag_doc = 1;
   					var d = new Date(parseInt(doc.cal_time));
         			str=str+d.getFullYear()+"/"+ (d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"," + doc.temperature + "\n";
   					socket.emit('draw',str);
   					console.log("str = " + str);
   				} else {
   					if(flag_doc == 0){
   						socket.emit('draw', "warning");
   						console.log("doc is null");
   					}
   					flag_doc = 2;
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