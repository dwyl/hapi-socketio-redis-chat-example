
function publish () {
  console.log(' - - - - > PUBLISHING < - - - - - ');
  publisher.on("ready", function () {
    publisher.publish("chat", "people");
  });
}

module.exports = {
  publish: publish,
  publisher: publisher
};
