var QUnit = require('qunitjs'); // require QUnit node.js module
var test = QUnit.test; // stores a copy of QUnit.test
require('qunit-tap')(QUnit, console.log); // use console.log for test output
// console.log(test.toString());
var redisClient = require('../lib/redis_connection')();
// console.log(redisClient);


// var test = require('tape');
var dir    = __dirname.split('/')[__dirname.split('/').length-1];
var file   = dir + __filename.replace(__dirname, '') + " -> ";

// console.log('hello!');

test(file +" Confirm RedisCloud is accessible GET/SET", function(Q) {
  // console.log('this')
  var done = Q.async();
  redisClient.set('redis', 'working', redisClient.print);
  // console.log('this')
  redisClient.get('redis', function (err, reply) {
    Q.equal(reply.toString(), 'working', 'RedisCLOUD is ' +reply.toString());
    done();
  });
});

test('teardown', function(Q){
  var uncache = require('./uncache').uncache; // http://goo.gl/JIjK9Y - - - \\
  redisClient.end();   // ensure redis con closed! - \\
  // uncache('../lib/redis_connection');         // uncache redis con  - - - - \\
  // console.log(redisClient)
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
