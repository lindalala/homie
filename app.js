var messageRoutes = require('./routes/serverSocket.js');
var express = require('express');
var morgan = require('morgan'); //for static files
// var bson = require('bson');
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: '342347555966814',
    clientSecret: '376925f96f4449f2af1f6773d5eaa443',
    callbackURL: "http://localhost:50000/"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));



var express = require('express'),
  http = require('http'),
  morgan = require('morgan'),
  app = express();

  

// Set the views directory
app.set('views', __dirname + '/views');
// Define the view (templating) engine
app.set('view engine', 'ejs');
// Log requests
app.use(morgan('tiny'));

// This is where your normal app.get, app.put, etc middleware would go.

// Handle static files
app.use(express.static(__dirname + '/public'));


// app.get('/', function(request, response){
//   response.send('<h1>Hello world</h1>');
// });

app.get("/:houseName", function(req, response) {
 
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));



// var SimpleStaticServer = function() {
//     var self = this;  
//     self.app = express();
//     var http = require('http');
//     var httpServer = http.Server(self.app);
//     var sio =require('socket.io');
//     var io = sio(httpServer);
//     messageRoutes.init(io);
//     // Set the views directory
//     self.app.set('views', __dirname + '/views');
    
//     // Define the view (templating) engine
//     self.app.set('view engine', 'ejs');
//     // Log requests
//     self.app.use(morgan('tiny'));


    // self.app.get('/auth/facebook', passport.authenticate('facebook'));
    // self.app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/',
    //                                   failureRedirect: '/login' }));

//     // Handle static files
//     self.app.use(express.static(__dirname + '/public'));
//     self.app.use(morgan('[:date] :method :url :status')); // Log requests
  
//   // start the server
//   self.start = function() {
  
//      self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
//      self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8000;
//      self.host      = process.env.OPENSHIFT_MONGODB_DB_HOST;

//      console.log('host'+ self.host);

    
//     httpServer.listen(self.port, self.ipaddress);
//   };
// }; 


 // var sss = new SimpleStaticServer();
 // sss.start();


var http = require('http');
/*1*/ var httpServer = http.Server(app);
var sio = require('socket.io');
var io = sio(httpServer);
var serverSocket = require('./routes/serverSocket.js');
serverSocket.init(io);
/*2*/ var sio =require('socket.io');
// /*3*/ var io = sio(httpServer);

/*4*/ httpServer.listen(50000, function() {console.log('Listening on 50000');});
