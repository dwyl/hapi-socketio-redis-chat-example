var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var msg_count = 0;

// Most clients probably don't do much on "subscribe".  This example uses it to coordinate things within one program.
sub.on("subscribe", function (channel, count) {
    console.log("sub subscribed to " + channel + ", " + count + " total subscriptions");
    if (count === 2) {
        pub.publish("a nice channel", "I am sending a message.");
        pub.publish("another one", "I am sending a second message.");
        pub.publish("a nice channel", "I am sending my last message.");
    }
});

sub.on("unsubscribe", function (channel, count) {
    console.log("sub unsubscribed from " + channel + ", " + count + " total subscriptions");
    if (count === 0) {
        pub.end();
        sub.end();
    }
});

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    msg_count += 1;
    if (msg_count === 3) {
        sub.unsubscribe();
    }
});

sub.on("ready", function () {
    // if you need auth, do it here
    sub.incr("did a thing");
    sub.subscribe("a nice channel", "another one");
});

pub.on("ready", function () {
    // if you need auth, do it here
});
