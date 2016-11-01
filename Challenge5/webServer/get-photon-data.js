/*References
    https://docs.particle.io/reference/javascript/
    https://www.hackster.io/makers-ns/photon-nodejs-e48cf3
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('speedControl.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var Particle = require('particle-api-js');
var particle = new Particle();

particle.login({username: 'lanyao1117@163.com', password: 'Yaolan126126'});

var token = '6ea0af554732fcc2f979e663c468f724e68eb3b0';
var d_uid = '230044001547353236343033';
var timer;
var cmd = "";//initialize cmd

timer = setInterval(talk_with_photon,3000);

function talk_with_photon() {
    //g_var(d_uid, token);
    c_func(d_uid, token);          
}

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on('speed', function(msg){
    cmd = msg;//real cmd comes from html file
  });
});

//Get my devices events
//"Speed" is the event published on particle cloud
particle.getEventStream({ deviceId: d_uid, auth: token }).then(function(stream) {
  stream.on('Speed', function(data) {
    console.log("Speed: " + data);
    io.emit('display', data);
  });
});

function c_func(d_id, l_token) {
    var fnPr = particle.callFunction({ deviceId: d_id, name: 'setSpeed', argument: cmd, auth: l_token });
    fnPr.then(
        function (data) {
            console.log('setSpeed called succesfully with cmd ' + cmd + ' : ', data.body.return_value);
        }, function (err) {
            console.log('An error occurred:', err);
        });
}

// function g_var(d_id,l_token){
//     particle.getVariable({ deviceId: d_id, name: 'Lidar_right', auth: l_token }).then(
//         function (data) {
//             console.log('Lidar_right:', data.body.result);
//         }, function (err) {
//             console.log('An error occurred while getting attrs:', err);
//         });
//     particle.getVariable({ deviceId: d_id, name: 'Lidar_left', auth: l_token }).then(
//         function (data) {
//             console.log('Lidar_left:', data.body.result);
//         }, function (err) {
//             console.log('An error occurred while getting attrs:', err);
//         });
// }
