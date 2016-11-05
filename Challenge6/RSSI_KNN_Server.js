var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 3000;

var app = require('express')();
var express=require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var KNN = require('ml-knn');

app.use('/fonts', express.static(__dirname + 'webpage/fonts'));
app.use('/images', express.static(__dirname + '/webpage/images'));
app.use('/', express.static(__dirname + '/webpage'));


app.get('/localization', function(req, res){
  res.sendfile('webpage/index.html');
});

var knn = new KNN();

var trainingSet = [[43,55,102,78],
[47,68,94,69],
[51,55,99,79],
[56,68,95,78],
[60,75,95,75],
[60,72,82,70],
[60,68,71,65],
[66,70,63,55],
[76,50,92,38],
[71,58,100,45],
[73,50,99,55],
[72,47,102,60],
[60,52,102,60],
[57,44,102,62],
[52,41,102,65],
[57,33,102,77],
[48,48,102,63]];
var predictions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

knn.train(trainingSet, predictions);

knn.k = 3;

var dataset = [[0,0,0,0]];

//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
  baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
});

http.listen(4000, function(){
  //listen on localhost port 4000
  console.log('listening on *:4000');
});


var sp;
sp = new SerialPort.SerialPort(portName, portConfig);


//Create a packet to be sent to all other XBEE units on the PAN.
// The value of 'data' is meaningless, for now.
var RSSIRequestPacket = {
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "000000000000ffff",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
}

var requestRSSI = function(){
  sp.write(XBeeAPI.buildFrame(RSSIRequestPacket));
  //console.log(XBeeAPI.buildFrame(RSSIRequestPacket));
}

sp.on("open", function () {
  console.log('open');
  requestRSSI();
  setInterval(requestRSSI, sampleDelay);
});

XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
    console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
    if(frame.data[1] == 1)
    {
      dataset[0][0] = frame.data[0];
      console.log("Beacon 1 : " + dataset[0][0]);
    }
    if(frame.data[1] == 2)
    {
      dataset[0][1] = frame.data[0];
      console.log("Beacon 2 : " + dataset[0][1]);
    }
    if(frame.data[1] == 3)
    {
      dataset[0][2] = frame.data[0];
      console.log("Beacon 3 : " + dataset[0][2]);
    }
    if(frame.data[1] == 4)
    {
      dataset[0][3] = frame.data[0];
      console.log("Beacon 4 : " + dataset[0][3]);
    }

    var ans = knn.predict(dataset);
    io.emit('location', ans);
    console.log("answer: " + ans);
  }
});