$( document ).ready(function() {
  var socket = io(); // initialise socket.io connection

  function getName() {
    // prompt for person's name before allowing to post
    var name = Cookies.get('name');
    if(!name) {
      name = window.prompt("What is your name/handle?");
      Cookies.set('name', name);
    }
    socket.emit('io:name', name);
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
    var html = "<li class='row'>";
    html += "<small class='time'>" + getTime(msg.t)  + " </small>";
    html += "<span class='name'>" + msg.n + ": </span>";
    html += "<span class='msg'>"  + msg.m + "</span>";
    html += "</li>";
    $('#messages').append(html);  // append to list
    return;
  }

  function sanitise(txt) {
    if(txt.indexOf("<") > -1 || txt.indexOf(">") > -1) {
      txt = 'tries to inject : ' +  txt.replace(/</g, "&lt").replace(/>/g, "&gt");
    }
    return txt;
  }

  $('form').submit(function() {
    if(!Cookies.get('name') || Cookies.get('name').length < 1 || Cookies.get('name') === 'null') {
      getName();
      return false;
    } else {
      var msg  = $('#m').val();
      socket.emit('io:message', sanitise(msg));
      $('#m').val(''); // clear message form ready for next/new message
      return false;
    }
  });

  // keeps latest message at the bottom of the screen
  // http://stackoverflow.com/a/11910887/2870306
  function scrollToBottom () {
    $(window).scrollTop($('#messages').height());
  }

  window.onresize = function(){
    scrollToBottom();
  }

  socket.on('chat:messages:latest', function(msg) {
    console.log(">> " +msg);
    renderMessage(msg);
    scrollToBottom();
  });

  socket.on('chat:people:new', function(name) {
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
        scrollToBottom();
    })
  }
  loadMessages();
});
