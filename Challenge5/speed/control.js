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

http.listen(3000, function(){
  console.log('listening on *:3000');
});
//Get speed from Particle
