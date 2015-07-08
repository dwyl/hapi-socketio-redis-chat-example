(function() {
	'use strict';
	var pub         = require('./redis_connection')();
	var sub         = require('./redis_connection')();
	// console.log(sub);
	var redisClient = require('./redis_connection')();
	var SocketIO    = require('socket.io');
	var io; // GLOBAL to this IIFE

	// setup redis pubsub independently of any socket.io connections
	pub.on("ready", function () {
		console.log("PUB Ready!");
		sub.on("ready", function () {
			console.log('SUB Ready!');
			sub.incr("did a thing");
			sub.subscribe("chat:messages:latest", "chat:people:new");
		});
	});

	function chatHandler (socket) {

		// welcome new clients
		socket.emit('io:welcome', 'hi!');

		socket.on('io:name', function (name) {
			redisClient.HSET("people", socket.client.conn.id, name);
			console.log(socket.client.conn.id, name + ' joined!');
			pub.publish("chat:people:new", name);
		});

		socket.on('io:message', function (msg) {
			console.log("io:message received: ", msg);
			redisClient.HGET("people", socket.client.conn.id, function (err, name) {
				console.log('from: ', name);
				var obj = { // store each message as a JSON object
					m: msg,
					t: new Date().getTime(),
					n: name
				}
				var str = JSON.stringify(obj)
				redisClient.RPUSH("chat:messages", str);
				pub.publish("chat:messages:latest", str);
			})
		});
		/* istanbul ignore next */
		socket.on('error', function (err) { console.error(err.stack) })
		// how should we TEST socket.io error? (suggestions please!)

		sub.on("message", function (channel, message) {
			console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
		  console.log("client1 channel " + channel + ": " + message);
			console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
			socket.emit(channel, message);
		});

		sub.on("subscribe", function (channel, count) {
		  console.log("client1 subscribed to " + channel + ", " + count + " total subscriptions");
			console.log(' - - - - > PUBLISHING < - - - - - ');
			var msg = {"m":"Welcome to Hapi+Redis Chat!","t":1436263599489,"n":"Server"};
			pub.publish("chat:messages:latest", msg);
		});


	}


	/**
	 * chat is our Public interface
	 * @param {object} (http) listener [required]
	 */
	function init (listener) {
		io = SocketIO.listen(listener);
		io.on('connection', chatHandler);
	}

	module.exports = {
		init: init,
		pub: pub,
		sub: sub,
		redisClient: redisClient
	};

}()); // benalman.com/news/2010/11/immediately-invoked-function-expression
