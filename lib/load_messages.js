var redisClient = require('./redis_connection')(); // RedisCloud

function loadMessages (req, reply) {
  redisClient.lrange("chat", 0, -1, function(err, data) {
    /* istanbul ignore next */
		if(err){ console.log(err) }
		// console.log(data);
    reply(data);
  });
}

module.exports = {
  load: loadMessages,
  redisClient: redisClient
};
