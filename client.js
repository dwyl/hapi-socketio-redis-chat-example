var socket = io(); // initialise socket.io connection
$('form').submit(function() {
  var msg = $('#m').val()
  socket.emit('message', msg);
  console.log(msg);
  // $('#messages').append('<li>' + msg + '</li>'); // append to list
  $('#m').val(''); // clear message form ready for next/new message
  return false;
});

socket.on('message', function(msg){
  $('#messages').append($('<li>').text(msg));  // append to list
});
