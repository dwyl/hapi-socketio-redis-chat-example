var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output
var redisClient = require('../lib/redis_connection');

var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";

var http = require('http');
var server = http.createServer(function (req, res) {
  res.end("hello world\n");
}).listen(8000);

var chat = require('../lib/chat')(server);
// start SocketIO CLIENT so we can connect
var ioclient = require('socket.io-client');


test(file +" Socket.io Tests", function(Q) {
  var done = Q.async();
  var message = 'its not always rainbows and butterflies...';
  setTimeout(function() {
    var ioptions = {
      transports: ['websocket'],
      'force new connection': true,
      reconnect: true
    }
    var client = ioclient.connect('http://0.0.0.0:8000', ioptions);
    // console.log(client);
    client.on('connect',function(data) {
      console.log(' - - - - > CONNECTED!!')
      // send a message BEFORE registering:
      client.emit('message', message);
      setTimeout(function() { // wait 500ms and then register
        client.emit('name', 'Adam');
        client.emit('message', message);
      })
    });
    client.on('name', function(data) {
      console.log(' - - - - - - - > ', data);
      Q.ok(data, "✓ name received")
    });

    client.on('message', function(data) {
      console.log(' - - - - - - - > ', data);
      var msg = JSON.parse(data);
      Q.equal(msg.m, message, "✓ message received: " + msg.m);
    });

    // wait before cleaning up:
    setTimeout(function() {
      client.disconnect();
      Q.ok(true, "✓ Cleanup Complete");
      var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\
      require('../lib/redis_connection').end();   // ensure redis con closed! - \\
      uncache('../lib/redis_connection');         // uncache redis con  - - - - \\
      server.close();
      done();
    },3000);

  },1000);

});


/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
