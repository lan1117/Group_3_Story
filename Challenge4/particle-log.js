// Set up Express.js 
 var express = require('express');
 var app = require('express')();
 var server = require('http').Server(app);
 var io = require('socket.io')(server);
 var EventSource = require('eventsource'); // Pull in event source
var LogEvent = require('./models/LogEvent.js');
var config = require('./config/config.json'); 
var fs = require('fs');
 // Load libraries
 var bodyParser = require('body-parser');
 var morgan = require('morgan');
 var argv = require('minimist')(process.argv.slice(2)); 
 var CSVLogging = ("c" in argv);
 var CSVName = argv["c"];
 
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
 if (CSVLogging){
	console.log("CSV Logging to file " + CSVName + ". NOTE: No logs being added to MongoDB at this time and server is OFF");
 }
 
 // Set up logging
 app.use(morgan('dev'));
 
 // Set up body parsing
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: false }));
 
 // Set up static content
 app.use(express.static(__dirname + '/node_modules')); // client-side frameworks
 app.use(express.static(__dirname + '/public')); // HTML, CSS
 app.get('/', function(req, res){
	res.sendfile('historical.html');});
 
 // Set up favicon
 //app.use(favicon(__dirname + '/public/favicon.ico'));
 // Enable server and db connections only if CSV Logging is off (can always get a csv from the server if server is on)
 if (!CSVLogging){ 
 	// Connect to Mongodb
 	require('./config/db')();
	 // Set up app routes
	require('./config/routes')(app); 
	io.on('connection',function(socket){ 
 	}); 
	if (!module.parent) {
		var port = process.env.PORT || 3000; // 9000 as default
	 	// On Linux make sure you have root to open port 80
	 	server.listen(port, function() {
	 	console.log('Listening on port ' + port);
	 	});
 	}
	
 } 


 module.exports = function(CSVLogging, CSVName){
	var es = new EventSource("https://api.particle.io/v1/devices/events?access_token="+config.access_token); // Listen to the stream 
	for (index in config.events){
		es.addEventListener(config.events[index],function(message){ handleEvent(message, config.events[index], CSVLogging, CSVName)});
	}
} 

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


function handleEvent (message, eventName, CSVLogging, CSVName) {
	//console.log("New Message");
	realData = JSON.parse(message.data);
	//console.log(realData);
	realData.name = eventName;
	//console.log(CSVLogging);
	var time = getDateTime();
	var sensor_date = new Date();
	realData.newtime = realData.published_at.substring(0,10) + " " + realData.published_at.substring(11,19);
	//console.log(realData.newtime);
	var sensor = {
		"sensor_id" : realData.name,
		"temperature" : realData.data,
		"unit" : "*C",
		"cal_time" : sensor_date.getTime(),
		"time" : realData.newtime
	}
	//console.log(sensor);
	var insertDocument = function(db, callback) {
		db.collection('test').insertOne(sensor, function(err, result){
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
//	if (!CSVLogging){	// currently you can only CSV log when not logging to mongodb
//		addRecord(realData); 
//	} else{ 
//		updateCSV(realData, CSVName);	
	//}
}
 //require('./handle-device.js')(CSVLogging, CSVName);
 exports = module.exports = app;



io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('disconnect')
	});
	//this is a private message
	//for real-time
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
   			console.log(string[3]);

   			
   			if(string[1] != "" && string[2] != ""){
   				var cursor = db.collection('test').find({"sensor_id":string[3],"cal_time":{$gt:timestamp1,$lt:timestamp2}});
   			}
   			else{
   				var cursor =db.collection(string[0]).find({"sensor_id":string[3]});
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

