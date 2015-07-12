(function() {
	'use strict';

	var redis = require('redis');
	var rc    = require('../lib/redis_config.js'); // config for RedisCloud/Local
	var pub   = redis.createClient(rc.port, rc.host, {no_ready_check: true});
	pub.auth(rc.auth)
	var sub   = redis.createClient(rc.port, rc.host, {no_ready_check: true});
	sub.auth(rc.auth)

	var SocketIO = require('socket.io');
	var io; // GLOBAL to this IIFE

	function chatHandler (socket) {

		// welcome new clients
		socket.emit('io:welcome', 'hi!');

		socket.on('io:name', function (name) {
			pub.HSET("people", socket.client.conn.id, name);
			// console.log(socket.client.conn.id + " > " + name + ' joined chat!');
			pub.publish("chat:people:new", name);
		});

		socket.on('io:message', function (msg) {
			pub.HGET("people", socket.client.conn.id, function (err, name) {
				// console.log("io:message received: " + msg + " | from: " + name);
				var str = JSON.stringify({ // store each message as a JSON object
					m: msg,
					t: new Date().getTime(),
					n: name
				});
				pub.RPUSH("chat:messages", str);   // chat history
				pub.publish("chat:messages:latest", str);  // latest message
			})
		});
		// Here's where all Redis messages get relayed to Socket.io clients
		sub.on("message", function (channel, message) {
		  console.log(channel + " : " + message);
			socket.emit(channel, message); // relay to all connected socket.io clients
		});

		/* istanbul ignore next */
		socket.on('error', function (err) { console.error(err.stack) })
		// how should we TEST socket.io error? (suggestions please!)
	}


	/**
	 * chat is our Public interface
	 * @param {object} (http) listener [required]
	 */
	function init (listener, callback) {
		// setup redis pub/sub independently of any socket.io connections
		pub.on("ready", function () {
			// console.log("PUB Ready!");
			sub.on("ready", function () {
				sub.subscribe("chat:messages:latest", "chat:people:new");
				// now start the socket.io
				io = SocketIO.listen(listener);
				io.on('connection', chatHandler);
				callback();
			});
		});
	}

	module.exports = {
		init: init,
		pub: pub,
		sub: sub
	};

}()); // benalman.com/news/2010/11/immediately-invoked-function-expression
