var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output
var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\

var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";

var REDISCLOUD_URL = process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
var redis       = require('redis');
var rc          = require('../lib/redis_config.js'); // config for Cloud/Local
var redisClient;
// delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis

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
  chat.sub.unsubscribe();   // unsubscribe (duh!)
  chat.sub.end();           // end subscriber connection
  chat.pub.end();           // ensure redis publisher connnection closed! - \\
  chat.redisClient.end();   // ensure redis client connnection closed! - \\
  uncache('../lib/redis_config.js')         // uncache redis con  - - - - \\
  server.close();
  done();
});


/*** TEST LOCAL REDIS Instance ***/

var redis = require('redis');

test(file +" Connect to LOCAL Redis instance and GET/SET", function(Q) {
  var done = Q.async();
  delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
  uncache('../lib/redis_config.js');
  rc  = require('../lib/redis_config.js');
  redisClient = redis.createClient(rc.port, rc.host)
  redisClient.auth(rc.auth);
  Q.equal(redisClient.address, '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
  redisClient.set('redis', 'LOCAL', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    Q.equal(reply.toString(), 'LOCAL', '✓ LOCAL Redis is ' +reply.toString());
    done();
  });
});

test('Close Connection to LOCAL Redis', function(Q){
  redisClient.end();   // ensure redis con closed! - \\
  Q.equal(redisClient.connected, false,  "✓ Connection to LOCAL Closed");
});

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
