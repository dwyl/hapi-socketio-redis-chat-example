var redis = require('redis');
var url   = require('url');
var Hoek  = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
Hoek.assert(process.env.REDISCLOUD_URL,
  'Please Set the REDISCLOUD_URL environment variable!');
// export REDISCLOUD_URL='getKeyFromHeroku'
var redisURL    = url.parse(process.env.REDISCLOUD_URL);
var redisClient = redis.createClient(redisURL.port, redisURL.hostname,
                  {no_ready_check: true});
redisClient.auth(redisURL.auth.split(":")[1]);
module.exports = redisClient;
