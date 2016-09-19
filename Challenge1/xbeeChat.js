var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messgae;
var temp = 0;


var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};


var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

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
  sp.on('data', function(data) {
		//var count = 0;
		//var flag = [0, 0];
		//var tempArray = [0,0];

    console.log(data); // log incoming data from XBee
    message = data.split(':'); //separate data
    console.log(message);
		temp = parseFloat(message[1]);
   //if(message[0] == '1' && flag[0] == 0){

      //names.push(message[0]);
      //tempArray[0]= parseFloat(message[1]);
			//flag[0] = 1;
      //count ++;

     //console.log(TempArray[0]);
   //}
	 /*
   if(message[0]=='2' && flag[1] == 0){

      //names.push(message[0]);
      tempArray[1] = parseFloat(message[1]);
			flag[1] = 1;
      count ++;
   }
	 */
	 //if (count == 2){
		 //var average = (sum(tempArray[0], tempArray[1]) / count).toFixed(2);

		 console.log(temp);
		 var Temp = "Temperature is " + temp;
		 io.emit("hello world");
	 //}
  });
});
