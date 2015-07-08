var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: Number(process.env.PORT || 8000)
});

server.route([
  { method: 'GET', path: '/', handler: { file: "index.html" } },
	// switch these two routes for a /static handler?
  { method: 'GET', path: '/client.js', handler: { file: './client.js' } },
  { method: 'GET', path: '/style.css', handler: { file: './style.css' } },
  { method: 'GET', path: '/load', handler: require('./lib/load_messages') },
	{ method: 'GET', path: '/socket.io.js',
		handler: {
			file: './node_modules/socket.io-client/socket.io.js'
		}
	}
]);

server.start(function () {
	require('./lib/chat')(server.listener);
	require('./lib/publish')();
});

module.exports = server;
