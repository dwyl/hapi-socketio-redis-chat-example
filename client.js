var socket = io(); // initialise socket.io connection

function getName() {
  // prompt for person's name before allowing to post
  var name = Cookies.get('name');
  if(!name) {
    name = window.prompt("What is your name/handle?");
    Cookies.set('name', name);
  }
  console.log('name: ', name);
  socket.emit('name', name);
  $( "#m" ).focus(); // focus cursor on the message input
  return name;
}

function leadZero(number) {
  return (number < 10) ? '0'+number : number;
}

function getTime(timestamp) {
  var t, h, m, s, time;
  t = new Date(timestamp);
  h = leadZero(t.getHours());
  m = leadZero(t.getMinutes());
  s = leadZero(t.getSeconds());
  return '' + h  + ':' + m + ':' + s;
}

/**
 * renders messages to the DOM
 * nothing fancy
 */
function renderMessage(msg) {
  msg = JSON.parse(msg);
  console.log(msg);
  var html = "<li class='row'>";
  html += "<small class='time'>" + getTime(msg.t)  + " </small>";
  html += "<span class='name'>" + msg.n + ": </span>";
  html += "<span class='msg'>"  + msg.m + "</span>";
  html += "</li>";
  $('#messages').append(html);  // append to list
  return;
}


$('form').submit(function() {
  if(!Cookies.get('name') || Cookies.get('name').length < 1 || Cookies.get('name') === null) {
    getName();
    return false;
  } else {
    var msg  = $('#m').val()
    socket.emit('message', msg);
    // console.log(msg);
    $('#m').val(''); // clear message form ready for next/new message
    return false;
  }
});

socket.on('message', function(msg) {
  renderMessage(msg);
});


socket.on('name', function(name) {
  $('#joiners').show();
  $('#joined').text(name)
  $('#joiners').fadeOut(5000);
});

getName();

function loadMessages() {
  $.get('/load', function(data){
    console.log(data);
    data.map(function(msg){
      renderMessage(msg);
    })
  })
}
loadMessages();
