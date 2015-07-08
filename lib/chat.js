(function() {
	'use strict';
	var redisClient = require('./redis_connection'); // RedisCloud
	var SocketIO = require('socket.io');
	var io; // GLOBAL to this IIFE

	function chatHandler (socket) {

		socket.on('name', function (name) {
			redisClient.HSET("people", socket.client.conn.id, name);
			console.log(socket.client.conn.id, name + ' joined!');
			io.emit('name', name);
		});

		socket.on('message', function (msg) {
			redisClient.HGET("people", socket.client.conn.id, function (err, name) {
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
		/* istanbul ignore next */
		socket.on('error', function (err) { console.error(err.stack) })
		// how should we handle socket.io error? (suggestions please!)
	}

	/**
	 * chat is our Public interface
	 * @param {object} (http) listener [required]
	 */
	function chat (listener) {
		io = SocketIO.listen(listener);
		io.on('connection', chatHandler);
	}

	module.exports = chat;

}()); // benalman.com/news/2010/11/immediately-invoked-function-expression
