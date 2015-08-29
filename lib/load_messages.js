var redisClient = require('redis-connection')();

function loadMessages (req, reply) {
  redisClient.lrange("chat:messages", 0, -1, function (err, data) {
    reply(data);
  });
}

module.exports = {
  load: loadMessages,
  redisClient: redisClient
};
