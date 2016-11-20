# EC544 Challenge6 -- Find the device.

In this challenge, we created a system that localized a mobile device (XBee coordinator) using four immobile devices (XBee routers) in an indoor environment. We also completed graphically location display of the mobile device in real time.

## RssiBeacon

This folder includes file that is flashed into 4 XBee routers.

We constructed functions to receive/send packets/responses between routers and coordinator.

## knnData

This folder contains csv files that stores RSS data from 4 XBee routers. 

Data is used to implement kNN data training. We classified the indoor environment into 50 points, which stands for 50 classes in kNN method. In every class, we stored 4 ~ 6 datasets for better prediction.

## RSSI_KNN_Server.js

This is the Javascript file that runs on server (PC or Raspberry Pi). 

It receives RSS from 4 XBee routers and processes RSS data by kNN method. On the other hand, it sends prediction answer to html with socket.io and complete graphic diplay.

In order to run server in terminal:
- npm install serialport express xbee-api csv-write-stream socket.io ml-knn
- node listPorts.js (to find out port that XBee coordinator is using)
- node RSSI_KNN_Server.js <<PORT>>

## webpage

This folder includes files that realize graphic in door location display on HTML. 

It receives prediction answer every second and processes answer into X-Y coordinate for display.

## IOS Application

This folder contains files that implements IOS application to remote control/display in door location of mobile device.

Details are written in this folder.