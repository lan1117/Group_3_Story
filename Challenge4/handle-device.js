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
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
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
	console.log("New Message");
	realData = JSON.parse(message.data);
	console.log(realData);
	realData.name = eventName;
	console.log(CSVLogging);
	var time = getDateTime();
	var sensor_date = new Date();
	realData.newtime = realData.published_at.substring(0,10) + " " + realData.published_at.substring(11,19);
	//console.log(realData.newtime);
	var sensor = {
		"sensor_id" : realData.data.substring(0,1),
		"temperature" : realData.data.substring(1,6),
		"unit" : "*C",
		"cal_time" : sensor_date.getTime(),
		"time" : realData.newtime
	}
	console.log(sensor);
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
