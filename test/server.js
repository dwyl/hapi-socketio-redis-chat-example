var assert  = require('assert');                     // node.js core assertions
var lab     = exports.lab = require('lab').script(); // exports lab for CLI run
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + ' ->';

var server = require('../server.js');
var chat   = require('../lib/chat.js');

lab.test(file +" GET / returns status 200", function(done) {
  var options = {
    method  : "GET",
    url     : "/"
  };
  server.inject(options, function(res) {
    assert.equal(res.statusCode, 200, 'home page loads');
    done();
  });
});

lab.test(file +" GET /load returns previous messages", function(done) {
  var options = {
    method  : "GET",
    url     : "/load"
  };
  server.inject(options, function(res) {
    assert.equal(res.statusCode, 200, 'previous messages received');
    var messages = JSON.parse(res.payload);
    assert(messages.length > 0);
    done();
  });
});

lab.test(file +" Teardown > End Redis Connection & Stop Hapi Server", function(done) {
  chat.pub.end();
  chat.sub.end();
  require('../lib/load_messages').redisClient.end();
  uncache('../lib/load_messages'); // uncache redis con  - - - - \\
  uncache('../lib/chat');
  assert.equal(chat.sub.connected, false);
  server.stop();
  done();
});
