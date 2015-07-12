var test  = require('tape');
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var redis   = require('redis');

// var REDISCLOUD_URL = process.env.REDISCLOUD_URL;
uncache('../lib/redis_config.js');
console.log('- - > process.env.REDISCLOUD_URL '+ process.env.REDISCLOUD_URL);

test(file +" Confirm RedisCloud is accessible GET/SET", function(t) {

  var rc  = require('../lib/redis_config.js');
  console.log(rc);
  var redisClient = redis.createClient(rc.port, rc.host, {no_ready_check: true});
  redisClient.auth(rc.auth);

  redisClient.set('redis', 'working', redisClient.print);
  console.log("✓ Redis Client connected to: " + redisClient.address);
  t.ok(redisClient.address !== '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
  redisClient.get('redis', function (err, reply) {
    t.equal(reply.toString(), 'working', '✓ RedisCLOUD is ' +reply.toString());
    redisClient.end();   // ensure redis con closed! - \\
    t.equal(redisClient.connected, false, "✓ Connection to RedisCloud Closed");
    uncache('../lib/redis_config.js');
    t.end();
  });
});
