var childproc = require('./childprocess')(); // basic child process runner
var terminate = require('terminate');
setTimeout(function(){
  // terminate(childproc, function(){
    console.log('done');
  // })
}, 10000);
