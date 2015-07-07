var redisClient = require('./lib/redis_connection'); // RedisCloud
var Hapi = require('hapi');
var SocketIO = require('socket.io');
var server = new Hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: Number(process.env.PORT || 8000)
});

var io = SocketIO.listen(server.listener);

function loadMessages (req, reply) {
  redisClient.lrange("chat", 0, -1, function(err, data) {
    /* istanbul ignore next */
		if(err){ console.log(err) }
		// console.log(data);
    reply(data);
  });
}

server.route([
  { method: 'GET', path: '/', handler: { file: "index.html" } },
  { method: 'GET', path: '/client.js', handler: { file: './client.js' } },
  { method: 'GET', path: '/style.css', handler: { file: './style.css' } },
  { method: 'GET', path: '/load', handler: loadMessages },
	{ method: 'GET', path: '/socket.io.js',
		handler: {
			file: './node_modules/socket.io-client/socket.io.js'
		}
	}
]);

server.start(function () {
  io.on('connection', require('./lib/chat_handler.js'));
});

module.exports = server;
