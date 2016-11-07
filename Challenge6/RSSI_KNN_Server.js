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
[[45,89,66,80],[46,92,67,80],[51,87,69,81],[45,89,69,81],
[39,82,65,80],[39,80,66,78],[39,80,66,77],[39,81,66,78],
[42,88,77,75],[43,90,77,71],[42,88,75,75],[42,90,75,76],
[54,82,66,80],[54,81,67,80],[55,81,68,80],[54,82,66,84],
[50,93,64,85],[48,88,69,83],[46,93,72,84],[47,89,73,80],
[51,87,60,75],[50,85,59,75],[52,84,57,76],[48,87,57,75],
[54,89,61,79],[55,89,59,76],[53,88,60,80],[53,90,61,75],
[59,100,63,82],[54,90,65,81],[51,92,67,79],[49,96,60,70],
[58,94,61,73],[61,94,62,71],[60,95,72,75],[59,95,71,76],
[62,101,64,77],[66,102,63,78],[69,102,67,77],[65,102,68,74],
[61,98,58,74], [57,102,53,64], [57,99,55,74], [67,97,54,77],
[48,101,62,79], [49,100,60,80], [51,102,57,79], [48,102,62,71],
[68,102,53,66], [51,100,54,65], [54,101,53,71],[58,96,54,69],
[60,98,71,69],[55,101,76,68],[55,102,59,71],[55,102,59,69],
[58,102,45,61],[49,98,47,66],[55,100,46,62],[56,102,46,62],
[61,101,49,58],[60,102,48,61],[63,102,51,59],[61,102,49,58],
[64,103,48,68],[65,102,49,67],[59,102,43,67],[59,99,45,70],
[59,103,41,50],[62,103,43,50],[57,101,44,50],[58,102,43,50],
[55,103,43,47],[54,101,39,54],[51,102,39,45],[53,102,39,48],
[78,102,34,47],[76,102,34,46],[77,102,34,45],[76,102,34,46],
[69,100,47,52],[72,102,46,51],[74,101,48,41],[74,101,37,56],
[77,102,45,54],[75,102,43,51],[77,102,45,52],[74,102,43,51],
[72,97,46,45],[70,102,51,43],[75,101,42,48],[73,102,38,43],
[76,102,45,48],[72,102,46,53],[73,102,45,51],[76,102,45,51],
[81,101,48,45],[80,100,49,51],[77,102,54,48],[76,99,46,45],
[76,102,49,37],[77,102,50,37],[72,102,49,36],[73,102,61,44],
[81,96,54,41],[73,92,52,35],[72,90,55,35],[77,95,51,42],
[71,89,47,36],[71,90,44,37],[69,91,46,36],[70,93,46,37],
[79,90,59,40],[82,95,65,43],[81,91,65,42],[81,95,60,39],
[72,92,63,55],[72,96,62,53],[72,97,63,52],[74,93,62,74],
[77,90,76,64],[73,84,76,55],[74,90,67,51],[72,89,67,52],
[69,86,67,50],[68,90,66,61],[75,98,68,54],[76,96,72,54],
[75,96,71,55],[78,98,68,54],[73,89,82,59],[72,88,74,58],
[73,94,75,62],[73,94,82,60],[66,98,63,57],[67,96,64,54],
[67,97,67,54],[69,96,67,58],[74,82,78,66],[75,82,79,59],
[81,81,79,65],[75,81,74,63],[65,83,78,64],[63,83,82,67],
[63,84,77,66],[63,86,85,69],[80,98,80,68],[70,93,78,74],
[69,87,77,72],[67,87,83,73],[65,80,86,71],[69,80,79,67],
[70,81,78,67],[70,81,80,69],[64,80,83,81],[64,80,83,82],
[65,80,85,75],[64,80,87,79],[71,81,85,74],[65,84,81,73],
[71,85,88,75],[67,85,86,72],[62,90,83,70],[61,88,81,71],
[61,93,82,68],[58,94,82,70],[58,82,82,77],[57,80,81,83],
[58,79,89,78],[57,81,83,74],[57,78,83,80],[55,83,86,73],
[69,87,83,72],[61,83,85,72],[46,80,86,73],[49,77,86,79],
[45,86,82,83],[49,73,85,82],[63,64,70,68],[53,66,70,69],
[64,65,71,71],[52,64,71,69],[49,67,82,75],[48,68,76,81],
[45,70,77,81],[42,70,80,82],[44,68,77,82],[47,69,78,78],
[42,68,83,82],[42,70,79,83],[59,77,79,81],[51,76,79,86],
[44,78,76,85],[50,87,74,81],[38,76,86,79],[38,75,87,80],
[39,87,82,87],[39,76,79,85],[42,100,78,80],[42,78,77,80],
[43,78,78,79],[40,88,83,80]];

var predictions = [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4,
 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
  9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13,
   13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16,
    16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20,
     20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 23, 23, 23,
      23, 24, 24, 24, 24, 25, 25, 25, 25, 26, 26, 26, 26, 27,
       27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29, 30, 30, 30,
        30, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 33, 33, 33,
         33, 34, 34, 34, 34, 35, 35, 35, 35, 36, 36, 36, 36, 37,
          37, 37, 37, 38, 38, 38, 38, 39, 39, 39, 39, 40, 40, 40, 
           40, 41, 41, 41, 41, 42, 42, 42, 42, 43, 43, 43, 43, 44,
            44, 44, 44, 45, 45, 45, 45, 46, 46, 46, 46, 47, 47, 47,
             47, 48, 48, 48, 48, 49, 49, 49, 49, 50, 50, 50, 50];

knn.train(trainingSet, predictions);

knn.k = 1;

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