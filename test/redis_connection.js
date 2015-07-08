var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output

var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";
var redisClient = require('../lib/redis_connection')(); // RedisCloud
var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\


test(file +" Confirm RedisCloud is accessible GET/SET", function(Q) {
  var done = Q.async();
  redisClient.set('redis', 'working', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    Q.equal(reply.toString(), 'working', 'RedisCLOUD is ' +reply.toString());
    done();
  });
});

test('Close Connection to RedisCloud', function(Q){
  var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\
  redisClient.end();   // ensure redis con closed! - \\
  Q.equal(redisClient.connected, false);
});

test(file +" Connect to LOCAL Redis instance and GET/SET", function(Q) {
  var done = Q.async();
  delete process.env.REDISCLOUD_URL; // ensures we connect to LOCAL redis
  uncache('../lib/redis_connection');
  redisClient = require('../lib/redis_connection')(); // LOCAL Redis
  Q.equal(redisClient.address, '127.0.0.1:6379', "Redis Client connected to: " + redisClient.address)
  redisClient.set('redis', 'LOCAL', redisClient.print);
  redisClient.get('redis', function (err, reply) {
    Q.equal(reply.toString(), 'LOCAL', 'LOCAL Redis is ' +reply.toString());
    done();
  });
});

test('Close Connection to LOCAL Redis', function(Q){
  redisClient.end();   // ensure redis con closed! - \\
  Q.equal(redisClient.connected, false);
});

// tape doesn't have a "after" function. see: http://git.io/vf0BM - - - - - - \\
// so... we have to add this test to *every* file to tidy up. - - - - - - - - \\
// test(file + " cleanup =^..^= \n", function(t) { // - - - - - - - - - -  - - - \\
//   var uncache = require('./uncache').uncache;   // http://goo.gl/JIjK9Y - - - \\
//   redisClient.end();     // ensure redis con closed! - \\
//   uncache('../lib/redis_connection');           // uncache redis con  - - - - \\
//   t.end();                      // end the tape test.   - - - - - - - - - - - \\
// }); // tedious but necessary  - - - - - - - - - - - - - - - - - - - - - - - - \\


/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run tests
