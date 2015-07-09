var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output
// var redisClient = require('../lib/redis_connection')();

var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";

// create a simple http server to attach our socket.io listener to
var http = require('http');
var server = http.createServer(function (req, res) {
  res.end("hello world\n");
}).listen(5000);

var chat = require('../lib/chat');
var ioclient    = require('socket.io-client');
var client; // GLOBAL (only to the test!)

test(file +" Socket.io Tests", function(Q) {
  var done = Q.async();
  var message = 'its not always rainbows and butterflies...';
  chat.init(server, function(){
    var ioptions = {
      transports: ['websocket'],
      'force new connection': true,
      reconnect: true
    }
    client = ioclient.connect('http://0.0.0.0:5000', ioptions);
    // console.log(client);
    client.on('connect', function(data) {
      console.log('TEST Chat Client CONNECTED!!')
      // send a message BEFORE registering
      client.emit('io:message', message);

      setTimeout(function() { // wait 500ms and then register
        client.emit('io:name', 'Adam');
        setTimeout(function(){
          client.emit('io:message', message);
          setTimeout(function() {
            Q.ok(true, "✓ Socket.io tests complete");
            done();
          },100);
        },200);
      }, 300);
    });

    client.on('io:welcome', function(data) {
      console.log('TEST Welcome - > ', data);
      Q.ok(data, "✓ Welcome Received")
    });

    client.on('chat:people:new', function(data) {
      console.log('TEST chat:people:new - > ', data);
      Q.ok(data, "✓ name received")
    });

    client.on("chat:messages:latest", function(data) {
      console.log("TEST chat:messages:latest - > ", data);
      var msg = JSON.parse(data);
      Q.equal(msg.m, message, "✓ message received: " + msg.m);
    });

  },1000);

});

test(file +" Socket.io Tests", function(Q) {
  var done = Q.async();
  client.disconnect();
  Q.ok(true, "✓ Cleanup Complete");
  var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\
  // require('../lib/redis_connection')().end();
  chat.sub.unsubscribe();   // unsubscribe (duh!)
  chat.sub.end();           // end subscriber connection
  chat.pub.end();           // ensure redis publisher connnection closed! - \\
  chat.redisClient.end();   // ensure redis client connnection closed! - \\
  uncache('../lib/redis_config.js')         // uncache redis con  - - - - \\
  server.close();
  done();
});






/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
