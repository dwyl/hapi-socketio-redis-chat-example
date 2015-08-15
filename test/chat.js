var test  = require('tape');
var decache = require('decache'); // http://goo.gl/JIjK9Y

var dir     = __dirname.split('/')[__dirname.split('/').length-1];
var file    = dir + __filename.replace(__dirname, '') + " -> ";

var server   = require('../server.js');
var chat     = require('../lib/chat');
var ioclient = require('socket.io-client');

test(file + " Socket.io Tests", function(t) {

  var message = 'its not <b>always</b> rainbows and butterflies...';
  var messageSanitised = message.replace(/</g, "&lt").replace(/>/g, "&gt")

  var options = {
    method  : "GET",
    url     : "/"
  };

  server.inject(options, function () {

    var ioptions = {
      transports: ['websocket'],
      'force new connection': true,
      reconnect: true
    };

    var client = ioclient.connect('http://0.0.0.0:' + process.env.PORT, ioptions);
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
      t.equal(msg.m, messageSanitised, "✓ message received: " + msg.m);
    });

    client.on('connect', function(data) {

      console.log('TEST Chat Client CONNECTED!!')
      // send a message BEFORE registering
      client.emit('io:message', message);

      setTimeout(function() { // wait 500ms and then register

        client.emit('io:name', 'Adam');
        setTimeout(function(){

          client.emit('io:message', message);
          setTimeout(function() {

            client.disconnect();
            // server.stop();
            // require('../lib/load_messages').redisClient.end();
            console.log(chat.sub.address);
            chat.sub.unsubscribe();   // unsubscribe (duh!)
            chat.sub.end();           // end subscriber connection
            chat.pub.end();           // ensure redis publisher connnection closed! - \\
            t.ok(chat.sub.connected === false, "✓ Cleanup Complete");
            t.end();
          },100);
        },200);
      }, 300);
    });
  }); // end server.start
});
