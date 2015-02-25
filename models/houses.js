var util = require("util");
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/housemates';
var mongoDB; // The connected database
// Use connect method to connect to the Server
var connection_string = '127.0.0.1:27017/housemates';
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) console.log(err);
  console.log("Connected correctly to server");
  mongoDB = db;
});


// var util = require("util");
// var mongoClient = require('mongodb').MongoClient;
// var mongoDB; // The connected database
// Use connect method to connect to the Server
// var connection_string = '127.0.0.1:27017/beatq';
// if OPENSHIFT env variables are present, use the available connection info:
// if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
//   connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
//   process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
//   process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
//   process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
//   process.env.OPENSHIFT_APP_NAME;
// }


// mongoClient.connect('mongodb://'+connection_string, function(err, db) {
//   if (err) console.log(err);
//   console.log("Connected correctly to server");
//   mongoDB = db;
// });




/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "fallTest") is the name of the database
 */


var House = {
    // this.x = x;   
    addNewHouse : function(collection, query, callback){
       mongoDB.collection(collection).insert([{houseName: query}], {
              safe: true
            }, 
            function(err, crsr) {
            if (err) console.log(err);
            console.log("completed mongo insert");
            
            console.log("done with insert callback");
            console.log(crsr);
        });
    },

    fetchHouseInfo : function(){
      
        mongoDB.collection("houses").find(
            {count: 3}, 
            {
              upsert: true
            }, 
            function(err, crsr) {
              if (err) {console.log("err");}
              else {
                
                console.log("found the player");
                
              }
        });
    }

}




 
module.exports = House;