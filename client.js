var socket = io(); // initialise socket.io connection

function getName() {
  // prompt for person's name before allowing to post
  var name = window.prompt("What is your name/handle?");
  console.log(name);
  socket.emit('name', name);
  return name;
}

$('form').submit(function() {
  var msg  = $('#m').val()
  // var name = getName();
  // var obj  =
  socket.emit('message', msg);
  console.log(msg);
  // $('#messages').append('<li>' + msg + '</li>'); // append to list
  $('#m').val(''); // clear message form ready for next/new message
  return false;
});

socket.on('message', function(msg){
  $('#messages').append($('<li>').text(msg));  // append to list
});
