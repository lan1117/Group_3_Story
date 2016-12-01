var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');

var csvWriter = require('csv-write-stream');
var fs = require('fs');
var writer = csvWriter();
writer.pipe(fs.createWriteStream('out.csv'));

var i = 1;
var j = 1;
var m = 1;
var n = 1;
var answer = 1;

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 2000;

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

var trainingSet = 
[[41,68,68,74],[40,67,67,75],[40,67,69,75],[40,67,68,74],[39,71,70,78],
[49,83,74,84],[48,84,77,80],[46,84,75,86],[43,82,70,81],[51,80,70,81],
[53,89,69,84],[47,88,69,84],[48,86,68,85],[47,79,69,83],[47,84,68,83],
[55,92,67,81],[56,91,67,82],[60,86,67,80],[59,84,68,80],[52,92,71,81],
[58,86,71,81],[53,88,77,82],[55,88,77,80],[58,88,80,81],[57,87,75,83],
[60,96,71,81],[58,93,69,78],[61,98,72,80],[63,95,73,80],[64,94,76,77],
[64,92,64,82],[57,90,63,84],[59,91,64,79],[62,92,64,82],[57,90,68,81],
[52,91,65,79],[51,92,63,80],[52,92,62,83],[52,92,61,81],[51,90,70,79],
[101,63,40,41],[101,56,37,46],[98,55,44,41],[101,50,49,45],[99,55,36,43],[98,53,39,49],[98,51,57,53],
[98,60,47,59],[99,61,51,56],[99,54,46,54],[95,59,43,51],[102,64,43,51],[99,51,46,57],[102,55,56,61],
[92,51,57,60],[97,67,51,59],[93,51,58,60],[95,62,68,63],[99,51,57,61],[99,51,57,61],[95,48,52,66],
[90,47,60,70],[88,53,63,68],[89,51,51,63],[100,62,62,64],[99,49,66,64],[92,44,58,72],[99,48,63,66],
[87,43,65,67],[90,57,69,75],[92,47,56,75],[101,58,63,66],[86,54,75,68],[90,42,63,69],[98,51,71,72],
[89,47,67,71],[81,47,67,80],[80,38,74,67],[83,58,68,83],[84,46,68,74],[87,44,62,69],[90,51,56,65],
[70,41,63,75],[72,42,71,72],[79,43,67,88],[70,44,60,68],[75,40,69,75],[73,39,64,73],[81,39,80,71],
[79,42,71,84],[72,37,76,75],[77,48,72,70],[75,48,76,78],[73,39,74,76],[69,40,82,80],[72,49,76,77]];

var predictions = [ 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 
                    6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 
                    11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15,
                    16, 16, 16, 16, 16, 16, 16];

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
  console.log("**********************************************************");
  if(answer > 0 && answer < 51) {
    io.emit('location', answer);
    //console.log("dataset: " + dataset);
    console.log("answer: " + answer);
  }
  writer.write({start: "START", Beacon:"", data: ""});
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
      //console.log("Beacon 1 : " + dataset[0][0]);
      writer.write({start: "", Beacon:"1", data: dataset[0][0]});
      i++;

    }
    if(frame.data[1] == 2)
    {

      dataset[0][1] = frame.data[0];
      //console.log("Beacon 2 : " + dataset[0][1]);
      writer.write({Beacon:"2", data: dataset[0][1]});
      j++;
    }
    if(frame.data[1] == 3)
    {

      dataset[0][2] = frame.data[0];
      //console.log("Beacon 3 : " + dataset[0][2]);
      writer.write({Beacon:"3", data: dataset[0][2]});
      m++;
    }
    if(frame.data[1] == 4)
    {

      dataset[0][3] = frame.data[0];
      //console.log("Beacon 4 : " + dataset[0][3]);
      writer.write({Beacon:"4", data: dataset[0][3]});
      n++;
    }

    answer = knn.predict(dataset);
    // io.emit('location', answer);
    // console.log("answer: " + answer);
  }
});