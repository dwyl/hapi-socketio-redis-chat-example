var assert  = require('assert');                     // node.js core assertions
var lab     = exports.lab = require('lab').script(); // exports lab for CLI run
var uncache = require('./uncache').uncache;          // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var redis   = require('redis');
var rc      = require('../lib/redis_config.js');
var redisClient;

var REDISCLOUD_URL = process.env.REDISCLOUD_URL;
console.log('- - - - - - - - > process.env.REDISCLOUD_URL '+ process.env.REDISCLOUD_URL);
lab.test(file +" Confirm RedisCloud is accessible GET/SET", function(done) {

redisClient = redis.createClient(rc.port, rc.host, {no_ready_check: true});
redisClient.auth(rc.auth)
  redisClient.set('redis', 'working', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    assert.equal(reply.toString(), 'working', '✓ RedisCLOUD is ' +reply.toString());
    done();
  });
});

lab.test('Close Connection to RedisCloud', function(done){
  var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\
  redisClient.end();   // ensure redis con closed! - \\
  assert.equal(redisClient.connected, false, "✓ Closed");
  done()
});

lab.test(file +" Connect to LOCAL Redis instance and GET/SET", function(done) {
  delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
  uncache('../lib/redis_config.js');
  rc  = require('../lib/redis_config.js');
  redisClient = redis.createClient(rc.port, rc.host)
  redisClient.auth(rc.auth);
  assert.equal(redisClient.address, '127.0.0.1:6379', "✓ Redis Client connected to: " + redisClient.address)
  redisClient.set('redis', 'LOCAL', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    assert.equal(reply.toString(), 'LOCAL', '✓ LOCAL Redis is ' +reply.toString());
    done();
  });
});

lab.test('Close Connection to LOCAL Redis', function(done){
  redisClient.end();   // ensure redis con closed! - \\
  assert.equal(redisClient.connected, false,  "✓ Connection to LOCAL Closed");
  process.env.REDISCLOUD_URL = REDISCLOUD_URL;
  done();
});

// tape doesn't have a "after" function. see: http://git.io/vf0BM - - - - - - \\
// so... we have to add this test to *every* file to tidy up. - - - - - - - - \\
// test(file + " cleanup =^..^= \n", function(t) { // - - - - - - - - - -  - - - \\
//   var uncache = require('./uncache').uncache;   // http://goo.gl/JIjK9Y - - - \\
//   redisClient.end();     // ensure redis con closed! - \\
//   uncache('../lib/redis_connection');           // uncache redis con  - - - - \\
//   t.end();                      // end the tape test.   - - - - - - - - - - - \\
// }); // tedious but necessary  - - - - - - - - - - - - - - - - - - - - - - - - \\
