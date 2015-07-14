var chalk = require('chalk'); // colorfull console output
// run the desired script as a child process
var spawn  = require('child_process').spawn; // we run our script in child processes
var path   = require('path')
var RUN    = false;
var port   = process.env.PORT;

console.log("__dirname: "+__dirname)
// console.log("env.PATH: " + process.env.PATH );
var script = path.resolve(__dirname + '/test-chat-server.js');
var command = 'node ' + script;

module.exports = function start() {
  console.log('Starting Child Process . . .');
  var RUN = false;
  var child = spawn(command); // pass in the script here

  child.stdout.setEncoding('utf8');

  child.stdout.on('data', function(data) {
    if(!RUN) { // this will only happen once
      console.log(chalk.yellow(data));
      RUN = true;
      // console.log("RUN: "+RUN)
    } else {
      // don't polute the console unless you are debugging
    }
    console.log(chalk.cyan(data))
  });

  child.stderr.on('data', function(data) {
    if(!RUN) {
      var str = data.toString();
      if(str.search('EADDRINUSE') === -1){
        console.log(data);
      }
      else {
        console.log(green("Running: "+cyan(command))
        +" at " + green(new Date().toTimeString() ));
        RUN = true;
      }
    }
  });

  child.on('close', function(code) {
      console.log(chalk.green('>> Closing Child Process'));
  });

  child.on('exit', function(code) {
      console.log(chalk.red('>> EXIT Child Process'));
  });

  child.on('error', function(code) {
      console.log(chalk.red('>> ERROR: '), code);
  });

  return child;
}
