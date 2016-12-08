

console.log("haahahh")
    var smoothie = new SmoothieChart( {
    grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)',
    lineWidth: 1, millisPerLine: 2000, verticalSections: 6, },
    minValue:-10,
    maxValue:50,
    interpolation:"step",
    labels: { fillStyle:'rgb(255, 255, 255)' },
    sharpLines:true,
    labels:{fontSize:15},
    timestampFormatter:SmoothieChart.timeFormatter
    });


    var lineA = new TimeSeries();
    var lineB = new TimeSeries();
    var lineC = new TimeSeries();
    var lineD = new TimeSeries();

    smoothie.addTimeSeries(lineA, { strokeStyle:'rgb(0 , 255 , 0)', fillStyle:'rgba(0, 255, 0, 0.3)', lineWidth:3 });
    smoothie.addTimeSeries(lineB, { strokeStyle:'rgb(0 ,0 , 255)', fillStyle:'rgba(0, 0, 255, 0.1)', lineWidth:3 });
    smoothie.addTimeSeries(lineC, { strokeStyle:'rgb(0 ,100 , 150)', fillStyle:'rgba(0, 0, 255, 0.1)', lineWidth:3 });
    smoothie.addTimeSeries(lineD, { strokeStyle:'rgb(0 ,0 , 0)', fillStyle:'rgba(0, 0, 255, 0.1)', lineWidth:3 });



    smoothie.streamTo(document.getElementById("mycanvas"), 1000);


    var socket = io.connect();


    socket.on("A", function(data) {
    console.log('this is A');
    lineA.append(new Date().getTime(),data);
    $(document.getElementById('val_one')).text(data);
    });

    socket.on("B", function(data) {
    console.log('this is A');
    lineB.append(new Date().getTime(),data);
    $(document.getElementById('val_two')).text(data);
    });

    socket.on("C", function(data) {
    console.log('this is A');
    lineC.append(new Date().getTime(),data);
    $(document.getElementById('val_three')).text(data);
    });

    socket.on("D", function(data) {
        console.log('this is A');
    lineD.append(new Date().getTime(),data);
    $(document.getElementById('val_four')).text(data);
    });


    $("#sensorA").click(function(){
    	console.log("clicked")
        var starttime = $("#starttime").val();
        var endtime = $("#endtime").val();
    //var string = starttime+","+endtime+","+"A";
    var string ="Historical Data"
    socket.emit("buttonPress",string);
    console.log("haha");
    });
    socket.on("A1", function(newString) {
/*  console.log(newString);
  var dataArray = newString.split(',');
  // var max = dataArray.length()
  for(var i = 0; i < 3 ; i++){
    console.log(dataArray[i]);
  lineA1.append(new Date(endTime - i*500).getTime(),dataArray[i]);
  };*/

var g = new Dygraph(document.getElementById("graphdiv"),
    newString,
{
    labels: [ "Time", "Sensor-A" ]

  }); 
});


