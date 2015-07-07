var redisClient = require('./lib/redis_connection'); // RedisCloud
var Hapi = require('hapi');
var SocketIO = require('socket.io');
var server = new Hapi.Server();
server.connection({
	host: '0.0.0.0',
	port: Number(process.env.PORT || 8000)
});

function loadMessages (req, reply) {
  redisClient.lrange("chat", 0, -1, function(err, data) {
    if(err){ console.log(err) }
    console.log(data);
    reply(data);
  });
}

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
  },
  { method: 'GET', path: '/load', handler: loadMessages }
]);

server.start(function () {
// console.dir(server.listener);
  var io = SocketIO.listen(server.listener);
  io.on('connection', function (socket) {
    console.log(socket.client.conn.id);

      socket.emit('Hello!');

      socket.on('name', function (name) {
        redisClient.HSET("people", socket.client.conn.id, name);
        console.log(socket.client.conn.id, name + ' joined!');
        io.emit('name', name);
      });

      socket.on('message', function (msg, etc) {

        redisClient.HGET("people", socket.client.conn.id, function (err, name) {
            if (err) {
              console.log(err);
            }
            console.log(name);
            var obj = { // store each message as an object
              m: msg,
              t: new Date().getTime(),
              n: name
            }
            var str = JSON.stringify(obj)
            redisClient.RPUSH("chat", str);
            console.log(str);
            io.emit('message', str);
        })
      });
  });
});
