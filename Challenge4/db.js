//Using particle-logger to store data recieved from phothon to MongoDB
//Download form https://github.com/suyashkumar/particle-logger
//Change db.js file in the config folder like this.
var mongoose = require('mongoose');
 
 var config = {
 url: process.env.MONGO_URI || 'mongodb://localhost/particlelog2'
 }; // The default port of MongoDB is 27017
 
 module.exports = function() {
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/27107/data/db');
 };
