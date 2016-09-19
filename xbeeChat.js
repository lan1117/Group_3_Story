var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ave = 0;

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};
var sp;
sp = new SerialPort(portName, portConfig);

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
  var temp = [200,200,200,200];//store temperature from two XBees

  sp.on('data', function(data) {
    console.log('data received: ' + data);
    var count = 0;
    var sum = 0;
    var ave = 0;
    info = data.split(':');//split temperature from data sent by routers

    switch(info[0]){
      case '1':
       temp[0] = parseFloat(info[1]);
       break;
      case '2':
       temp[1] = parseFloat(info[1]);
       break;
      case '3':
       temp[2] = parseFloat(info[1]);
       break;
      case '4':
       temp[3] = parseFloat(info[1]);
       break;
      default:
        console.log("ERROR when splitting data!");
    }

    for(var i = 0; i<temp.length; i++){
      if(temp[i] == 200){
          temp[i] = 0;
          console.log("XBee " + i + "NOT FOUND!");
          io.emit("chat message", "XBee " + i + "NOT FOUND!");
      }
      else
        count++;
      sum += temp[i];
      temp[i] = 200;
    }
    
    if(count != 0){
      ave = (sum/count).toFixed(2);
      io.emit("chat message", temp[0] + " " + temp[1] + "Average temperature: " + ave);
    }
    else{
      console.log("NO Xbee is FOUND!");
      io.emit("chat message", "NO Xbee is FOUND!");
    }
  });
});

