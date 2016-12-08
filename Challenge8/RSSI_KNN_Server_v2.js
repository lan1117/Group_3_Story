var SerialPort = require("serialport");

var CarStatus = "0";

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

portConfigAT = {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
};

//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfigAPI = {
  baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var portName1 = process.argv[2];//AT
var portName2 = process.argv[3];//API

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
[[77,54,73,66],[78,57,72,63],[72,48,82,67],[73,47,75,68],[89,50,68,78],[73,45,84,70],[76,51,75,66],[84,60,75,71],[71,51,71,68],[81,45,73,73],[68,55,78,59],[80,49,78,77],[70,47,72,74],
[76,55,70,60],[75,52,71,58],[88,55,76,77],[75,53,79,61],[93,55,70,68],[78,57,66,60],[75,55,76,61],[78,52,71,71],[80,59,75,69],[81,45,73,73],[75,46,73,64],[79,58,74,61],[69,50,82,69],
[95,66,80,57],[79,60,74,66],[79,63,72,62],[80,63,75,58],[79,54,70,60],[80,67,74,62],[80,55,79,59],[83,67,69,58],[82,59,70,58],[84,64,75,58],[77,58,77,64],[77,62,76,70],[91,66,65,60],
[87,72,70,51],[91,69,68,51],[96,68,71,69],[96,60,67,49],[89,68,57,69],[89,64,65,63],[92,72,74,57],[80,63,71,63],[91,72,66,54],[77,71,76,59],[76,59,71,61],[82,65,74,57],[88,67,78,58],
[82,69,61,54],[89,69,61,51],[96,76,67,57],[87,66,57,46],[92,70,63,46],[88,66,58,55],[81,66,66,56],[91,68,72,50],[90,72,65,66],[90,75,56,52],[97,64,62,51],[101,75,59,68],[79,75,68,51],
[93,66,55,60],[95,72,63,51],[99,73,61,39],[88,75,69,50],[94,66,71,45],[88,64,64,40],[93,69,68,47],[90,67,60,58],[87,68,60,41],[95,66,53,53],[88,73,59,55],[90,68,49,48],[88,64,64,51],
[89,61,49,48],[92,68,42,45],[89,66,57,37],[92,67,48,32],[93,68,50,36],[88,65,47,35],[73,68,57,34],[92,83,47,35],[90,74,44,42],[91,80,55,34],[95,78,53,35],[89,65,49,39],[84,68,42,36],
[101,72,40,48],[98,65,46,48],[101,67,56,41],[101,71,52,45],[96,66,45,43],[100,63,47,45],[99,69,45,41],[98,83,49,49],[100,73,48,42],[99,72,45,37],[98,77,45,39],[99,72,40,46],[100,79,48,52],
[101,63,40,41],[101,56,37,46],[98,55,44,41],[101,50,49,45],[99,55,36,43],[98,53,39,49],[98,51,57,53],[97,53,35,48],[88,50,36,49],[100,59,36,52],[99,59,46,57],[92,55,37,47],[95,51,39,50],
[98,60,47,59],[99,61,51,56],[99,54,46,54],[95,59,43,51],[102,64,43,51],[99,51,46,57],[102,55,56,61],[96,56,51,63],[101,65,48,69],[96,59,45,57],[98,59,54,55],[94,57,55,51],[98,49,41,57],
[92,51,57,60],[97,67,51,59],[93,51,58,60],[95,62,68,63],[99,51,57,61],[99,51,57,61],[95,48,52,66],[92,48,62,61],[87,57,53,69],[94,56,51,75],[92,62,57,66],[91,58,51,63],[100,57,53,67],
[90,47,60,70],[88,53,63,68],[89,51,51,63],[100,62,62,64],[99,49,66,64],[92,44,58,72],[99,48,63,66],[94,53,63,75],[99,51,59,69],[93,49,63,73],[94,51,68,71],[97,46,64,68],[98,52,64,73],
[87,43,65,67],[90,57,69,75],[92,47,56,75],[101,58,63,66],[86,54,75,68],[90,42,63,69],[98,51,71,72],[83,46,71,75],[93,43,69,76],[86,54,64,77],[85,45,58,80],[94,47,59,70],[91,54,62,72],
[89,47,67,71],[81,47,67,80],[80,38,74,67],[83,58,68,83],[84,46,68,74],[87,44,62,69],[90,51,56,65],[83,37,70,72],[91,46,70,72],[78,38,61,75],[89,46,58,73],[81,45,73,73],[87,44,66,73],
[70,41,63,75],[72,42,71,72],[79,43,67,88],[70,44,60,68],[75,40,69,75],[73,39,64,73],[81,39,80,71],[78,38,65,72],[70,41,60,66],[75,39,78,73],[71,43,62,78],[72,51,76,76],[77,44,73,72],
[79,42,71,84],[72,37,76,75],[77,48,72,70],[75,48,76,78],[73,39,74,76],[69,40,82,80],[72,49,76,77],[75,48,72,67],[67,50,73,70],[69,45,79,69],[84,45,74,73],[72,42,76,78],[67,39,70,75],];

var predictions = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
                    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4,  4, 4, 4, 4, 4, 4, 
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 
                    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8,  8, 8, 8, 8, 8, 8, 
                    9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 
                    11, 11, 11, 11, 11, 11, 11,  11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 
                    13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 
                    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16 ,16, 16, 16, 16, 16, 16];

knn.train(trainingSet, predictions);

knn.k = 3;

var dataset = [[0,0,0,0]];

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('updated CarStatus', CarStatus);
  socket.on('disconnect', function(){
  });
  socket.on('cStatus', function(msg){
    CarStatus = msg;
    sp1.write(msg + "\n");
    console.log('car status:' + msg);
  });
});

http.listen(4000, function(){
  //listen on localhost port 4000
  console.log('listening on *:4000');
});

var sp1;
var sp2;
sp1 = new SerialPort.SerialPort(portName1, portConfigAT);//AT
sp2 = new SerialPort.SerialPort(portName2, portConfigAPI);//API

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
  sp2.write(XBeeAPI.buildFrame(RSSIRequestPacket));
  console.log("**********************************************************");
  if(answer > 0 && answer < 51) {
    io.emit('location', answer);
    //console.log("dataset: " + dataset);
    console.log("answer: " + answer);

    if(answer == 8) {
      sp1.write("n");
      console.log("n");
    }
  }
  writer.write({start: "START", Beacon:"", data: ""});
}


sp1.on("open", function () {
  console.log('sp2 open');
  sp2.on("open", function () {
    console.log('sp1 open');
    // sp2.on('data', function(receivedStatus){
    //   io.emit('upcStatus', receivedStatus);
    //   console.log('received:' + receivedStatus);
    //   CarStatus = receivedStatus;
    // });
    requestRSSI();
    setInterval(requestRSSI, sampleDelay);
  });
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


