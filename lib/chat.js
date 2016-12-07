'use strict';

var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var handleError = require('hapi-error').handleError; // libraries.io/npm/hapi-error

var SocketIO = require('socket.io');
var io;

// please see: .
function sanitise (text) {
  var sanitised_text = text;

  /* istanbul ignore else */
  if (text.indexOf('<') > -1 /* istanbul ignore next */
     || text.indexOf('>') > -1) {
    sanitised_text = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }

  return sanitised_text;
}


function chatHandler (socket) {
  // welcome new clients
  socket.emit('io:welcome', 'hi!');

  socket.on('io:name', function (name) {
    pub.hset('people', socket.client.conn.id, name);
    // console.log(socket.client.conn.id + " > " + name + ' joined chat!');
    pub.publish('chat:people:new', name);
  });

  socket.on('io:message', function (msg) {
    // console.log('msg:', msg);
    var sanitised_message = sanitise(msg);
    var str;

    pub.hget('people', socket.client.conn.id, function (error, name) {
      // see: https://github.com/dwyl/hapi-error#handleerror-everywhere
      handleError(error, 'Error retrieving '
        + socket.client.conn.id + ' from Redis :-( for: ' + sanitised_message);
      // console.log("io:message received: " + msg + " | from: " + name);
      str = JSON.stringify({ // store each message as a JSON object
        m: sanitised_message,
        t: new Date().getTime(),
        n: name
      });

      pub.rpush('chat:messages', str);   // chat history
      pub.publish('chat:messages:latest', str);  // latest message
    });
  });

  /* istanbul ignore next */
  socket.on('error', function (error) {
    handleError(error, error.stack);
  });
  // how should we TEST socket.io error? (suggestions please!)
}


/**
 * chat is our Public interface
 * @param {object} listener [required] - the http/hapi server object.
 * @param {function} callback - called once the socket server is running.
 * @returns {function} - returns the callback after 300ms (ample boot time)
 */
function init (listener, callback) {
  // setup redis pub/sub independently of any socket.io connections
  pub.on('ready', function () {
    // console.log("PUB Ready!");
    sub.on('ready', function () {
      sub.subscribe('chat:messages:latest', 'chat:people:new');
      // now start the socket.io
      io = SocketIO.listen(listener);
      io.on('connection', chatHandler);
      // Here's where all Redis messages get relayed to Socket.io clients
      sub.on('message', function (channel, message) {
        // console.log(channel + ' : ' + message);
        io.emit(channel, message); // relay to all connected socket.io clients
      });

      return setTimeout(function () {
        return callback();
      }, 300); // wait for socket to boot
    });
  });
}

module.exports = {
  init: init,
  pub: pub,
  sub: sub
};
