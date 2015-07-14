var test  = require('tape');
var decache = require('decache');          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var redis   = require('redis');
var REDISCLOUD_URL = process.env.REDISCLOUD_URL;

test(file +" Connect to LOCAL Redis instance and GET/SET", function(t) {
  delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
  decache('../lib/redis_config.js');
  var rc  = require('../lib/redis_config.js')('dev');
  var redisClient = redis.createClient(rc.port, rc.host)
  redisClient.auth(rc.auth);
  t.equal(redisClient.address, '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
  redisClient.set('redis', 'LOCAL', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    t.equal(reply.toString(), 'LOCAL', '✓ LOCAL Redis is ' +reply.toString());
    redisClient.end();   // ensure redis con closed! - \\
    t.equal(redisClient.connected, false,  "✓ Connection to LOCAL Closed");
    process.env.REDISCLOUD_URL = REDISCLOUD_URL;
    t.end();
  });
});
