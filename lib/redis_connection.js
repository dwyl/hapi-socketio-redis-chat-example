var redis = require('redis');
var url   = require('url');

module.exports = function() {
  if(process.env.REDISCLOUD_URL) {
    var redisURL    = url.parse(process.env.REDISCLOUD_URL);
    var redisClient = redis.createClient(redisURL.port, redisURL.hostname,
                      {no_ready_check: true});
    redisClient.auth(redisURL.auth.split(":")[1]);
  }
  else {
    console.log(process.env.REDISCLOUD_URL,
      'Please Set the REDISCLOUD_URL environment variable!');
    // export REDISCLOUD_URL='getKeyFrom>Heroku>Appp>Settings>ConfigVars'

  }
  return redisClient;
}
