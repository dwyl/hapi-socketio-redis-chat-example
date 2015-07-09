var url   = require('url');
/**** determine if we are connecting to RedisCloud or Local Instance ****/
// console.log('WTF?! - - > process.env.REDISCLOUD_URL '+ process.env.REDISCLOUD_URL);
if(process.env.REDISCLOUD_URL) {
  var redisURL    = url.parse(process.env.REDISCLOUD_URL);
  var redisconfig = {
    port: redisURL.port,
    host: redisURL.hostname,
    auth: redisURL.auth.split(":")[1]
  }
}
else {   // export REDISCLOUD_URL='getKeyFrom>Heroku>Appp>Settings>ConfigVars'
// console.log(' \n Please Set REDISCLOUD_URL Environment Variable (from Heroku!)')
  var redisconfig = {
    port: 6379,
    host: '127.0.0.1',
    auth: null
  }
}

module.exports = redisconfig;
