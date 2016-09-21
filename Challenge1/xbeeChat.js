var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
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
		//flag_update[id - 1] = 0;

		// if(message[0] == '1' && flag[0] == 0){
		// 	tempArray[0]= parseFloat(message[1]);
		// 	flag[0] = 1;
		// 	count ++;
		// 	io.emit(message[0]);
		// };
		// if(message[0]=='2' && flag[1] == 0){

		// 	tempArray[1] = parseFloat(message[1]);
		// 	flag[1] = 1;
		// 	count ++;
		// 	io.emit(message[0]);
		// };
		// if(message[0] == '3' && flag[2] == 0){
		// 	tempArray[2]= parseFloat(message[1]);
		// 	flag[2] = 1;
		// 	count ++;
		// 	io.emit(message[0]);
		// };
		// if (count == 3){
		// 	var average = ((tempArray[0] + tempArray[1] + tempArray[2]) / count).toFixed(2);
		// 	count = 0;
		// 	flag = [0, 0, 0];

		// 	var Temp = "Temperature is " + average;
		// 	console.log(average);
		// 	io.emit("chat message", "An XBee says: " + Temp);
		// };
	});
});

function printAve(){
	//need updated counting numbers
	//and sum of these temperatures
	average = (sum / validnum).toFixed(2);
	var Temp = "Temperature is " + average;
	console.log(Temp);
	for(var i = 0 ; i < 4; i++){
		if(flag_update[i] == 0){
			console.log("XBee " + (i+1) + " is not responding.");
			io.emit("chat message", "XBee " + (i+1) + " is not responding.");
		}
	}
	for(var i = 0; i < 4; i++){
		console.log("XBee " + (i+1) + ": " + tempArray[i]);
	}
	flag_update = [0, 0, 0, 0]; 
	io.emit("chat message", Temp + " *C now");
	sum = 0;
	validnum = 0;
	var t = setTimeout(function(){printAve()}, 2000);
}
