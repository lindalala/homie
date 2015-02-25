var util = require("util");
var houseModel = require ('../models/houses.js');
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/housemates';
var mongoDB; // The connected database
// Use connect method to connect to the Server
mongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  console.log("Connected correctly to the Mongo server");
  mongoDB = db;
});
/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "fallTest") is the name of the databas
 */




exports.init = function(io) {
  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		console.log('a user connected');
        socket.on('new house', function (houseName){
            console.log('new house event was hit');
            // console.log(houseName);
            houseModel.addNewHouse("houses", houseName, function(crsr){});
        });
        socket.on('disconnect', function(data){
            console.log('a user disconnected');
        })
	});
}



