var assert  = require('assert');                     // node.js core assertions
var lab     = exports.lab = require('lab').script(); // exports lab for CLI run
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var redis   = require('redis');

lab.experiment('Redis LOCAL Connection Check', { timeout: 10000 }, function () {

  var REDISCLOUD_URL = process.env.REDISCLOUD_URL;

  lab.test(file +" Connect to LOCAL Redis instance and GET/SET", function(done) {
    delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
    uncache('../lib/redis_config.js');
    var rc  = require('../lib/redis_config.js');
    var redisClient = redis.createClient(rc.port, rc.host)
    redisClient.auth(rc.auth);
    assert.equal(redisClient.address, '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
    redisClient.set('redis', 'LOCAL', redisClient.print);
    redisClient.get('redis', function (err, reply) {
      assert.equal(reply.toString(), 'LOCAL', '✓ LOCAL Redis is ' +reply.toString());
      redisClient.end();   // ensure redis con closed! - \\
      assert.equal(redisClient.connected, false,  "✓ Connection to LOCAL Closed");
      done();
    });
  });

});
