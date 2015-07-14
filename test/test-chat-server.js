// create a simple http server to attach our socket.io listener to
var http = require('http');
var server = http.createServer(function (req, res) {
  res.end("hello world\n");
}).listen(process.env.PORT);

var ioclient = require('socket.io-client');
var chat = require('../lib/chat');
setTimeout(function(){
  chat.init(server, function () {
    console.log('Chat Server Ready!');
  });
},50);
