var node = document.getElementById('app');
var storedName = localStorage.getItem('name');
var socket = io();

if (storedName) {
  socket.emit('io:name', storedName);
}

var app = Elm.Main.embed(node, storedName
  ? storedName
  : null);

app.ports.setName.subscribe(function(name) {
  localStorage.setItem('name', name);
  socket.emit('io:name', name);
});

app.ports.sendMessage.subscribe(function(message) {
  socket.emit('io:message', message);
});

socket.on('chat:messages:latest', function(message) {
  app.ports.message.send(message);
});

socket.on('chat:people:new', function(name) {
  app.ports.name.send(name);
});
