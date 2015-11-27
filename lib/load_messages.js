var redisClient = require('redis-connection')();

function loadMessages(req, reply) {
  redisClient.lrange("chat:messages", 0, -1, function(err, data) {
    reply(data);
  });
}

function loadUsers(req, reply) {
  redisClient.HGETALL("currentUsers", function(err, data) {
      var values = Object.keys(data).map((key) => data[key]);
      console.log(values);
      var uniqueUserList = values.filter(function(elem, pos) {
        return values.indexOf(elem) == pos;
      });
      reply(uniqueUserList);
  });
}

module.exports = {
  load: loadMessages,
  loadUsers: loadUsers,
  redisClient: redisClient
};
