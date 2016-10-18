/*
 * handle-device.js
 * This module handles listening to the particle device stream and saving received data
 * in real time to the database (LogEvent models). It also has capability to send push 
 * notifications to clients using socketio when new packages arrive. 
 * @author: Suyash Kumar <suyashkumar2003@gmail.com>
 */
var EventSource = require('eventsource'); // Pull in event source
var LogEvent = require('./models/LogEvent.js');
var config = require('./config/config.json'); 
var fs = require('fs');
 var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/challenge2';

module.exports = function(CSVLogging, CSVName){
	var es = new EventSource("https://api.particle.io/v1/devices/events?access_token="+config.access_token); // Listen to the stream 
	for (index in config.events){
		es.addEventListener(config.events[index],function(message){ handleEvent(message, config.events[index], CSVLogging, CSVName)});
	}
} 

function handleEvent (message, eventName, CSVLogging, CSVName) {
	console.log("New Message");
	realData = JSON.parse(message.data);
	console.log(realData);
	realData.name = eventName;
	//console.log(CSVLogging);

	var insertDocument = function(db, callback) {
		db.collection('test').insertOne(realData, function(err, result){
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
/*function addRecord(data){
	var toAdd= {
		coreid:			data.coreid,
		published_at:	new Date(data.published_at), 
		data:			data.data,
		name:			data.name
	}
	console.log(toAdd);
	var newRecord = new LogEvent(toAdd);  
	newRecord.save(function(err,event){
		if(err) console.log("error in saving to database"+err);
	})
	// io.emit(data.probeid,newRecord);
}
function updateCSV(data, CSVName){
	var appendStr = '' + data.name + ', ' + data.coreid + ', ' + data.published_at + ', ' + data.data +"\n"; 	
	fs.appendFile(CSVName, appendStr, function(err){
		if(err) throw err;
	});
	console.log('Logged');
}*/




