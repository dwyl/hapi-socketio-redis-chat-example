var redis       = require('redis');
var rc          = require('../lib/redis_config.js')(process.env.NODE_ENV); // config for Cloud/Local
var redisClient = redis.createClient(rc.port, rc.host); // create client

redisClient.auth(rc.auth); // *optionally* authenticate when using RedisCloud

function loadMessages (req, reply) {
  redisClient.lrange("chat:messages", 0, -1, function (err, data) {
    reply(data);
  });
}

module.exports = {
  load: loadMessages,
  redisClient: redisClient
};
