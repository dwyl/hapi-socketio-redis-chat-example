var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output
var redisClient = require('../lib/redis_connection');

var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";

var server = require("../server.js");

test(file +" GET / returns status 200", function(Q) {
  var done = Q.async();
  var options = {
    method  : "GET",
    url     : "/"
  };
  console.log(options);
  server.inject(options, function(res) {
    Q.equal(res.statusCode, 200, 'home page loads');
    // server.stop();
    // var uncache = require('./uncache').uncache;   // http://goo.gl/JIjK9Y - - - \\
    // redisClient.end();     // ensure redis con closed! - \\
    // uncache('../lib/redis_connection');           // uncache redis con  - - - - \\
    done();
  });
});

test(file +" GET /load returns previous messages", function(Q) {
  var done = Q.async();
  var options = {
    method  : "GET",
    url     : "/load"
  };
  console.log(options);
  server.inject(options, function(res) {
    Q.equal(res.statusCode, 200, 'previous messages received');
    // console.log(res.payload);
    var messages = JSON.parse(res.payload);
    Q.ok(messages.length > 0);
    server.stop();
    var uncache = require('./uncache').uncache;   // http://goo.gl/JIjK9Y - - - \\
    redisClient.end();     // ensure redis con closed! - \\
    uncache('../lib/redis_connection');           // uncache redis con  - - - - \\
    done();
  });
});

// start SocketIO CLIENT so we can listen for the restart event
var io = require('socket.io').listen(5000);
var ioclient = require('socket.io-client');
var handler = require('../lib/chat_handler');

io.on('connection', handler);

test(file +" Socket.io Tests", function(Q) {
  var done = Q.async();
  // require('socket.io-client')();

  var options = {
    method  : "GET",
    url     : "/"
  };
  // server.inject(options, function(res) {
    ioptions = {
      transports: ['websocket'],
      'force new connection': true,
      reconnect: true
    }
    var client = ioclient.connect('http://0.0.0.0:5000', ioptions);
    // console.log(client);
    client.on('connect',function(data) {
      console.log(' - - - - > CONNECTED!!')
      client.emit('name', 'charlie');
    });
    client.on('name', function(data) {
      console.log(' - - - - - - - > ', data);
      Q.ok(data, "✓ name received")
    });
    setTimeout(function() {


      // wait before cleaning up:
      setTimeout(function() {
        client.disconnect();
        Q.ok(true, "✓ Cleanup Complete");
        server.stop();
        done();
      },3000);
    },1000);

  // });

});


/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
