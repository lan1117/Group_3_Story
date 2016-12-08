var Particle = require('particle-api-js');
var particle = new Particle();

var token='6ea0af554732fcc2f979e663c468f724e68eb3b0';
var d_uid='270028001847353236343033';
var timer1;

timer1 = setInterval(talk_with_photon,1000);

function talk_with_photon() {
    g_var(d_uid, token);
    c_func(d_uid, token);          
}

function g_var(d_id,l_token){
    particle.getVariable({ deviceId: d_id, name: 'Lidar_right', auth: l_token }).then(
        function (data) {
            console.log('Lidar_right:', data.body.result);
        }, function (err) {
            console.log('An error occurred while getting attrs:', err);
        });
    particle.getVariable({ deviceId: d_id, name: 'Lidar_left', auth: l_token }).then(
        function (data) {
            console.log('Lidar_left:', data.body.result);
        }, function (err) {
            console.log('An error occurred while getting attrs:', err);
        });
}

function c_func(d_id, l_token) {

    var fnPr = particle.callFunction({ deviceId: d_id, name: 'fun_test', argument: 'ON', auth: l_token });

    fnPr.then(
        function (data) {
            console.log('Function called succesfully ON: ', data.body.return_value);
        }, function (err) {
            console.log('An error occurred:', err);
        });
        
    // var fnPr2 = particle.callFunction({ deviceId: d_id, name: 'fun_test', argument: 'OFF', auth: l_token });

    // fnPr2.then(
    //     function (data) {
    //         console.log('Function called succesfully OFF: ', data.body.return_value);
    //     }, function (err) {
    //         console.log('An error occurred:', err);
    //     });
}