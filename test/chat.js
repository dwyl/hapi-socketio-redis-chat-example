var test    = require('tape');
var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";
var ioclient = require('socket.io-client');

var childproc = require('./childprocess'); // basic child process runner
var CHILD;
var terminate = require('terminate');

test(file +" initialize chat server in child process", function(t){
  CHILD = childproc();
  t.end();
})

test(file +" Socket.io Tests", function(t) {

  var message = 'its not always rainbows and butterflies...';
  console.log('- - - -'+message);

  setTimeout(function() {   // wait for the Child Process to initialize
    console.log(' - - - - - - COME ON!')
    // chat.init(server, function () {
      var ioptions = {
        transports: ['websocket'],
        'force new connection': true,
        reconnect: true
      }
      var client = ioclient.connect('http://0.0.0.0:'+process.env.PORT, ioptions);
      // console.log(client);

      client.on('io:welcome', function(data) {
        console.log('TEST Welcome - > ', data);
        t.ok(data, "✓ Welcome Received")
      });

      client.on('chat:people:new', function(data) {
        console.log('TEST chat:people:new - > ', data);
        t.equal(data, 'Adam', "✓ name received: "+data);
      });

      client.on("chat:messages:latest", function(data) {
        console.log("TEST chat:messages:latest - > ", data);
        var msg = JSON.parse(data);
        t.equal(msg.m, message, "✓ message received: " + msg.m);
      });

      client.on('connect', function(data) {
        console.log('TEST Chat Client CONNECTED!!')
        // send a message BEFORE registering
        client.emit('io:message', message);

        setTimeout(function() {
          client.emit('io:name', 'Adam');
          setTimeout(function(){
            client.emit('io:message', message);
            setTimeout(function() {
              client.disconnect();
              // server.close();
              require('../lib/load_messages').redisClient.end();
              // chat.sub.unsubscribe();   // unsubscribe (duh!)
              // chat.sub.end();           // end subscriber connection
              // chat.pub.end();           // ensure redis publisher connnection closed! - \\

              // t.ok(chat.sub.connected === false, "✓ Cleanup Complete");
              console.log('\n');

              setTimeout(function(){
                terminate(childproc, function(){
                  console.log('done');
                  t.end()
                })
              }, 200);

              // t.end();
            },200);
          },300);
        }, 400);
      });
    // }); // end chat.init
  },300);
});
//
// test(file + " Shut Down (terminate) test-chat-server.js child process", function(t){
//
//
// });
