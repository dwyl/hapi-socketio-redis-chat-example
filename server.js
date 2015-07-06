// To create a new socket.io handshake make a POST request to http://localhost:8000/socket.io/1
// use the resulting session ID for subsequent requests (see https://github.com/LearnBoost/socket.io-spec)
// For example, in the chrome debug console you can create a new WebSocket with the following URI
// 'ws://localhost:8000/socket.io/1/websocket/Ww4ULq6wOTUZYD62v3yu'
// where Ww4ULq6wOTUZYD62v3yu is the session ID
// var redis  = require("redis");
// var redis_client = redis.createClient();
var redis_client = require('./redis_connection');
// confirm redis is working as expected:
redis_client.set("Redis-Status", "Working");
redis_client.get("Redis-Status", function(err, reply) {
   console.log('Redis Status: ' + reply);
});

var Hapi = require('hapi');
var SocketIO = require('socket.io');
var server = new Hapi.Server();
server.connection({
	host: '0.0.0.0',
	port: Number(process.env.PORT || 8000)
});

server.route([
  { method: 'GET', path: '/', handler: { file: "index.html" } },
  { method: 'GET', path: '/socket.io.js',
    handler: {
      file: './node_modules/socket.io-client/socket.io.js'
    }
  },
  { method: 'GET', path: '/client.js',
  handler: {
      file: './client.js'
    }
  }
]);

server.start(function () {
// console.dir(server.listener);
  var io = SocketIO.listen(server.listener);
  io.on('connection', function (socket) {
    console.log(socket.client.conn.id);

      socket.emit('Hello!');

      socket.on('message', function (msg) {
        var obj = { // store each message as an object
          m: msg,
          t: new Date().getTime(),
          u: socket.client.conn.id
        }
        redis_client.RPUSH("chat", JSON.stringify(obj));
        console.log(msg);
        io.emit('message', msg);
      });
  });
});
