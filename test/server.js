var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output

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
    done();
  });
});

test(file +" Teardown > End Redis Connection & Stop Hapi Server", function(Q) {
  var done = Q.async();
  var uncache = require('./uncache').uncache;   // http://goo.gl/JIjK9Y - - - \\
  // var redisClient = require('../lib/redis_connection');
  // redisClient.end();     // ensure redis con closed! - \\
  require('../lib/chat').redisClient.end();
  require('../lib/chat').subscriber.end();
  require('../lib/publisher').publisher.end();
  require('../lib/load_messages').redisClient.end();
  uncache('../lib/load_messages'); // uncache redis con  - - - - \\
  uncache('../lib/chat');
  Q.equal(false, false);
  server.stop();
  done();
});

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
