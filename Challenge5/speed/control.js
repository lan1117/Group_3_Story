var app = require('express')();
var express=require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use('/css', express.static(__dirname + '/css'));
app.get('/style.css',function(req, res){
  res.sendfile('style.css');
});
app.use('/js', express.static(__dirname + '/js'));
app.get('/index.js',function(req, res){
  res.sendfile('index.js');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//Get speed from Particle
var Particle = require('particle-api-js');
var particle = new Particle();
var token='6ea0af554732fcc2f979e663c468f724e68eb3b0';

      console.log('111')
      var deviceID = "22002e001847353236343033";
      particle.getEventStream({ deviceId: deviceID, name: 'right', auth: token }).then(function(stream) {
        stream.on('event', function(data) {
        console.log("right: " + data.data);
        var right = data.data;
        });
        particle.getEventStream({ deviceId: deviceID, name: 'left', auth: token }).then(function(stream) {
          stream.on('event', function(data) {
          console.log("left: " + data.data);
          var left = data.data;
          });
     });

     /*io.on('connection', function(socket){
     	console.log('a user connected');
     	socket.on('disconnect', function(){
     	});

    }
