var redisClient = require('./redis_connection'); // RedisCloud
var SocketIO = require('socket.io');
// var io = SocketIO.listen();

function chatHandler (socket) {
		socket.on('name', function (name) {
			redisClient.HSET("people", socket.client.conn.id, name);
			console.log(socket.client.conn.id, name + ' joined!');
			io.emit('name', name);
		});

		socket.on('message', function (msg) {
			redisClient.HGET("people", socket.client.conn.id, function (err, name) {
					if (err) {
						console.log(err);
					}
					var obj = { // store each message as a JSON object
						m: msg,
						t: new Date().getTime(),
						n: name
					}
					var str = JSON.stringify(obj)
					redisClient.RPUSH("chat", str);
					io.emit('message', str);
			})
		});
    socket.on('error', function (err) { console.error(err.stack) })
}

module.exports = chatHandler;
