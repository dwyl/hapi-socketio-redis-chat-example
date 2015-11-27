var test    = require('tape');
var decache = require('decache'); // http://goo.gl/JIjK9Y
var path    = require('path');

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + ' ->';

var server = require('../server.js');
var chat   = require('../lib/chat.js');

test(file + " GET / returns status 200", function(t) {
  var options = {
    method  : "GET",
    url     : "/"
  };
  server.inject(options, function (res) {

    t.equal(res.statusCode, 200, 'home page loads');
    t.end();
  });
});

test(file + " GET /load returns previous messages", function(t) {
  var options = {
    method  : "GET",
    url     : "/load"
  };

  server.inject(options, function (res) {

    t.equal(res.statusCode, 200, 'previous messages received');
    var messages = JSON.stringify(res.payload);
    t.ok(messages.length > 0, "success!");
    t.end();
  });
});

test(file + " GET /loadUsers returns currentUsers", function(t) {
  var options = {
    method  : "GET",
    url     : "/loadUsers"
  };

  server.inject(options, function (res) {

    t.equal(res.statusCode, 200, 'current users received');
    var users = JSON.stringify(res.payload);
    t.ok(users.length > 0, "success!");
    t.end();
  });
});

test(file +" Teardown > End Redis Connection & Stop Hapi Server", function(t) {
  require('../lib/load_messages').redisClient.end();
  decache('../lib/load_messages'); // uncache redis con  - - - - \\
  decache('../lib/chat');
  server.stop(function(){});
  chat.sub.unsubscribe();   // unsubscribe (duh!)
  chat.sub.end();           // end subscriber connection
  chat.pub.end();           // ensure redis publisher connnection closed! - \\
  t.ok(chat.sub.connected === false, "✓ Cleanup Complete");
  t.end();
});
