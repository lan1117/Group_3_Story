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
var ans = 1;
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
[[41,73,64,84],[41,74,64,84],[41,73,63,86],[43,73,64,84],
[58,75,71,83],[55,77,71,83],[46,79,73,85],[44,78,71,84],
[49,88,76,80],[53,83,73,74],[53,84,75,74],[47,86,74,75],
[57,84,67,82],[48,86,64,77],[49,84,64,76],[49,83,63,78],
[70,90,64,80],[54,88,62,82],[69,94,62,82],[61,93,62,83],
[56,88,69,86],[57,89,69,78],[53,100,74,82],[51,90,72,80],
[61,93,77,78],[63,98,79,86],[69,97,75,86],[63,98,75,85],
[61,100,63,86],[55,101,65,83],[55,101,65,80],[63,102,69,79],
[49,94,61,79],[49,95,61,81],[49,97,63,87],[51,95,63,86],
[55,99,69,79],[57,103,65,82],[56,102,66,82],[61,102,63,82],
[63,102,64,74],[51,102,64,78],[55,101,59,72],[54,101,65,75],
[56,101,57,68],[55,102,58,68],[50,102,62,72],[50,100,62,66],
[52,102,55,69],[58,102,64,68],[57,101,66,68],[54,101,64,71],
[54,101,56,74],[55,102,53,64],[58,101,51,68],[58,102,51,68],
[62,101,58,69],[65,101,65,80],[60,101,52,59],[59,102,55,59],
[66,102,49,61],[65,102,57,64],[67,102,54,60],[66,102,53,62],
[65,102,45,63],[66,102,46,64],[64,102,43,63],[64,102,45,60],
[63,102,49,61],[71,102,45,59],[64,102,42,64],[66,102,42,62],
[74,102,43,51],[65,102,37,49],[69,102,38,49],[61,102,37,49],
[61,100,36,55],[72,101,41,52],[78,102,41,51],[72,101,40,52],
[69,102,39,55],[73,102,37,54],[70,102,37,52],[75,102,38,52],
[75,102,52,52],[70,102,49,52],[69,102,51,51],[72,102,57,51],
[76,102,45,48],[72,102,46,53],[73,102,45,51],[76,102,45,51],
[78,102,49,49],[82,103,49,47],[81,102,48,42],[80,101,49,42],
[72,101,55,45],[77,102,54,47],[73,102,62,51],[73,102,61,44],
[73,89,50,36],[75,89,52,39],[72,88,51,39],[72,89,49,40],
[73,84,60,37],[73,86,51,45],[74,87,51,45],[74,87,55,40],
[72,89,63,39],[71,89,68,43],[70,88,63,44],[71,88,62,45],
[77,88,64,57],[77,93,64,53],[75,93,67,54],[78,92,76,57],
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
  // if(answer > 0) {
  //     ans = answer;
  // }
  // io.emit('location', ans);
  // console.log("dataset: " + dataset);
  // console.log("answer: " + ans);
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
    io.emit('location', answer);
    console.log("answer: " + answer);
  }
});