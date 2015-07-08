var redis = require('./redis_connection'); // RedisCloud

function publish () {
  redis.on("ready", function () {
    redis.publish("chat", "name");
  });
}

module.exports = publish;
