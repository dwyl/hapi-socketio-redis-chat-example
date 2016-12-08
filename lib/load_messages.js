'use strict';

var redisClient = require('redis-connection')();
var handleError = require('hapi-error').handleError;

function loadMessages (req, reply) {
  redisClient.lrange('chat:messages', 0, -1, function (error, data) {
    handleError(error, error);

    return reply(data);
  });
}

module.exports = {
  load: loadMessages,
  redisClient: redisClient
};
