
 var mongoose = require('mongoose');
 
 var config = {
 url: process.env.MONGO_URI || 'mongodb://localhost/particlelog2'
 }; // The default port of MongoDB is 27017
 
 module.exports = function() {
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/27107/data/db');
 };
