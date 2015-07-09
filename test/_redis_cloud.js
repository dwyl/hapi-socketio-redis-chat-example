var assert  = require('assert');                     // node.js core assertions
var lab     = exports.lab = require('lab').script(); // exports lab for CLI run
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var redis   = require('redis');

lab.experiment('RedisCloud Connection Check', { timeout: 10000 }, function () {

  // var REDISCLOUD_URL = process.env.REDISCLOUD_URL;
  uncache('../lib/redis_config.js');
  console.log('- - > process.env.REDISCLOUD_URL '+ process.env.REDISCLOUD_URL);
  var rc          = require('../lib/redis_config.js');
  console.log(rc);
  var redisClient = redis.createClient(rc.port, rc.host, {no_ready_check: true});
  redisClient.auth(rc.auth);

  lab.test(file +" Confirm RedisCloud is accessible GET/SET", function(done) {

    redisClient.set('redis', 'working', redisClient.print);
    console.log("✓ Redis Client connected to: " + redisClient.address);
    assert(redisClient.address !== '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
    redisClient.get('redis', function (err, reply) {
      assert.equal(reply.toString(), 'working', '✓ RedisCLOUD is ' +reply.toString());
      redisClient.end();   // ensure redis con closed! - \\
      assert.equal(redisClient.connected, false, "✓ Closed");
      uncache('../lib/redis_config.js');
      done();
    });
  });

});
