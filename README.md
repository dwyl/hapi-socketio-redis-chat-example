# Hapi.js Socket.io Redis Chat Example

[![Build Status](https://travis-ci.org/dwyl/hapi-socketio-redis-chat-example.svg)](https://travis-ci.org/dwyl/hapi-socketio-redis-chat-example)
[![Test Coverage by codecov.io ](https://codecov.io/github/dwyl/hapi-socketio-redis-chat-example/coverage.svg?branch=master)](https://codecov.io/github/dwyl/hapi-socketio-redis-chat-example?branch=master)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-socketio-redis-chat-example/badges/gpa.svg)](https://codeclimate.com/github/dwyl/hapi-socketio-redis-chat-example)
[![Dependency Status](https://david-dm.org/dwyl/hapi-socketio-redis-chat-example.svg)](https://david-dm.org/dwyl/hapi-socketio-redis-chat-example)
[![devDependency Status](https://david-dm.org/dwyl/hapi-socketio-redis-chat-example/dev-status.svg)](https://david-dm.org/dwyl/hapi-socketio-redis-chat-example#info=devDependencies)

A basic chat application built with Hapi.js Socket.io and Redis Publish/Subscribe

> Try it: https://hapi-chat.herokuapp.com/

![hapi-chat-screenshot](http://i.imgur.com/jVZ1Xwi.png)

## Why?

Node.js Chat Apps are practically the "Hello World" of real-time apps.
If you Google for
"[node.js chat example](https://www.google.pt/search?q=node.js+chat+example)"
you will see *thousands* of results! But ... 90% of the examples use Express.js,
95% use MongoDB to store data/messages and **100% don't have _any_ tests**.
So, *this* example is for the the people who identify with:
> "_We use **hapi.js** because we want our code to be **performant** and **reliable**_"

As with *all* our examples we have a suite of tests.

## What?

[Real-Time](https://en.wikipedia.org/wiki/Real-time_computing#Near_real-time) Chat is an _integral_ part of _any_ communications system.  
Building a (*basic*) chat system is *easy* with Socket.io.

This example app shows you how to use Socket.io with Hapi.js and Redis for
a [***Horizontally Scalable***](http://stackoverflow.com/questions/11707879/difference-between-scaling-horizontally-and-vertically-for-databases) chat capable of
**_hundrededs of thousands_** of **_concurrent_ clients**.


## How?

We are using the following components to build our chat app:

1. **Hapi.js** (node.js web framework) - If you haven't used Hapi.js before, checkout our introductory tutorial: https://github.com/nelsonic/learn-hapi
+ **Socket.io** (WebSockets with fallback for older clients) - If you're new to Socket.io see: http://socket.io/get-started/chat/
+ **Redis** (high performance message storage and publish/subscribe) - If you or anyone on your team are *completely* new to Redis, check out: https://github.com/dwyl/learn-redis

### Why Redis?

Socket.io only handles distributing messages, if people disconnect from the chat they will miss any subsequent messages and when anyone connects there will see no history ... so we need a place to store messages for retrieval.

Top 3 reasons why Redis is the *clear* choice for storing chat messages.

1. ***Speed***  - **Redis** is _**much faster** than MongoDB, CouchDB or PostgreSQL_
2. ***Simple*** - pushing messages onto a list (set) is the _simplest
possible_ way to store a chat history. Given that we can store up to **512Mb** *per chat* and *stream* chat *history* to new clients (*low http overhead*) its an
*incredibly simple setup*!
3. ***Scalable*** ***Publish/Subscribe*** ("_pattern_") means you can scale *out*
(*add more node.js/socket.io servers when you need to serve more clients*)
Redis can already handle an ***order of magnitude*** more than other NoSQL Databases,
so your most likely "bottleneck" is node (*nuts, hey!?*)

### Publish / Subscribe ...?

The Publish Subscribe "_Pattern_" is (_still_) **the simple_st_** way of scaling software applications.
if you are new to this idea, see: https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern

### Mobile First

Given the simplicity of the UI, the chat app is mobile-first by default.
> _If anyone has time to **Pull Request** a few CSS media queries to make the UI **even better** on **mobile devices**, we would massively appreciate the contribution_!

### *Returning* Visitor

We use cookies to store the person's name on the client. If the person
clears cookies (_or uses private browsing / incognito mode_) they will be asked
for their name each time they open the chat window. (_this is pretty standard_).

####  How Many Recent Messages Should we Cache?

At present we are caching ***all the messages*** in Redis.
But a less RAM-hungry way to scale the app would be to store only the 50-100 most recent chat messages in Redis (RAM) and the remaining history in a cheaper on-disk storage e.g. ElasticSearch (_which would also enable searchability_)

### Data Model

Data Model we have used is incredibly simple.
It translates to an array of objects:

```js
var chat =  [
  '{"m":"Hi everyone!","t":1436263590869,"n":"Steve"}',
    '{"m":"Hi Steve! Welcome to Hapi Chat!","t":1436263599489,"n":"Foxy"}',
    '{"m":"Hapi Chat lets you chat with your friends!","t":1436263613141,"n":"Oprah"}',
    '{"m":"Cool! How does it scale?","t":1436263620853,"n":"Steve"}',
    '{"m":"Funny you should ask! It scales nicely because it uses Hapi.js and Redis!","t":1436263639989,"n":"Chroma"}',
    '{"m":"Sweet! ","t":1436263645610,"n":"Steve"}',
    '{"m":"Hello","t":1436264664835,"n":"Timmy"}',
    '{"m":"Hi!","t":1436267152379,"n":"Timmy"}',
    '{"m":"lkjlkjlk","t":1436270948402,"n":"dd"}',
    '{"m":"Big fan of the little notifications at the top when a person joins","t":1436273109909,"n":"iteles"}'
]
```
We use single letters for field keys:
+ **m** for **message**.
+ **n** for **name** of the person who wrote the message
+ **t** for **timestamp** the message was *received* by the node _server_ (_to avoid time-zone issues_);

# Run it! (_it's easy!_)

## Locally (_on your own machine_)

Try running the app! (_Its as easy as 1, 2, 3!_)

#### 1. Clone the Repository

```sh
git clone https://github.com/dwyl/hapi-socketio-redis-chat-example.git
cd hapi-socketio-redis-chat-example
```

#### 2. Install Redis (_if you don't already have it!_)

If you haven't already got an instance of Redis running on your machine,
Our Redis tutorial has instructions:
> https://github.com/dwyl/learn-redis#installation

#### 3. Install the Dependencies and Start the Server

Install the dependencies and *start* the app with:
```sh
npm install && npm start
```

> Now visit: http://127.0.0.1:8000 (_in your browser_)

## Running the _Tests_ (_Locally_)

To successfully run the tests you need to have an environment variable for RedisCloud
(this is because we like to know that our code works on both "local" and in a "production" environment...)

E.g:
```sh
export REDISCLOUD_URL=redis://rediscloud:yourpassword@pub-redis-12345.eu-west-1-2.1.ec2.garantiadata.com:12345
```

> _Given that our tests include checks for RedisCloud, you will need to have
internet access to run them ..._

## Heroku (deploying to Heroku)

Are you _new to_ deploying apps to _Heroku_? (_Message us we can talk/walk you through it..._!)


## Background Reading

+ **Matt Harrison** has *basic example*, but ***no tests*** (*bad habits ...*):
http://matt-harrison.com/using-hapi-js-with-socket-io
+ **Scalability**: https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling
+ Difference between scaling horizontally and vertically for databases:
http://stackoverflow.com/questions/11707879/difference-between-scaling-horizontally-and-vertically-for-databases
+ Using Pub/Sub for Asynchronous Communication:
http://www.rediscookbook.org/pubsub_for_asynchronous_communication.html
+ How to use Redis PUBLISH/SUBSCRIBE with Node.js to notify clients when data values change? http://stackoverflow.com/questions/4441798/how-to-use-redis-publish-subscribe-with-nodejs-to-notify-clients-when-data-value (_don't you **love** it when someone else has aready asked/answered your questions...?)
+ node_redis pub/sub example: https://github.com/mranney/node_redis/blob/master/examples/pub_sub.js
+ Redis PubSub example using express (_no tests_!): https://github.com/rajaraodv/redispubsub

[![HitCount](https://hitt.herokuapp.com/dwyl/hapi-socketio-redis-chat-example.svg)](https://github.com/dwyl/hapi-socketio-redis-chat-example)
