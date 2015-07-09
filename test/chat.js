var assert  = require('assert');                     // node.js core assertions
var lab     = exports.lab = require('lab').script(); // exports lab for CLI run
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

// var REDISCLOUD_URL = process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
// var redis       = require('redis');
// var rc          = require('../lib/redis_config.js'); // config for Cloud/Local
// var redisClient;
// delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis

// var Hapi = require('hapi');
var server = require('../server.js')

var chat = require('../lib/chat');
var ioclient = require('socket.io-client');

lab.experiment('Socket.io Chat E2E Tests', { timeout: 10000 }, function () {

  lab.test(file +" Socket.io Tests", function(done) {
    var message = 'its not always rainbows and butterflies...';
    var options = {
      method  : "GET",
      url     : "/"
    };
    server.inject(options, function () {
      var ioptions = {
        transports: ['websocket'],
        'force new connection': true,
        reconnect: true
      }
      var client = ioclient.connect('http://0.0.0.0:'+process.env.PORT, ioptions);
      // console.log(client);

      client.on('io:welcome', function(data) {
        console.log('TEST Welcome - > ', data);
        assert(data, "✓ Welcome Received")
      });

      client.on('chat:people:new', function(data) {
        console.log('TEST chat:people:new - > ', data);
        assert.equal(data, 'Adam', "✓ name received")
      });

      client.on("chat:messages:latest", function(data) {
        console.log("TEST chat:messages:latest - > ", data);
        var msg = JSON.parse(data);
        assert.equal(msg.m, message, "✓ message received: " + msg.m);
      });

      client.on('connect', function(data) {
        console.log('TEST Chat Client CONNECTED!!')
        // send a message BEFORE registering
        client.emit('io:message', message);

        setTimeout(function() { // wait 500ms and then register
          client.emit('io:name', 'Adam');
          setTimeout(function(){
            client.emit('io:message', message);
            setTimeout(function() {
              client.disconnect();
              server.stop();
              chat.sub.unsubscribe();   // unsubscribe (duh!)
              chat.sub.end();           // end subscriber connection
              chat.pub.end();           // ensure redis publisher connnection closed! - \\
              assert(chat.sub.connected === false, "✓ Cleanup Complete");
              done();
            },100);
          },200);
        }, 300);
      });
    }); // end server.start
  });

}); // end lab.experiment
