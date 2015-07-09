# Hapi.js Socket.io Redis Chat Example

A basic chat application built with Hapi.js Socket.io and Redis Pub/Sub

> Try it: https://hapi-chat.herokuapp.com/

![hapi-chat-demo](https://cdn.rawgit.com/nelsonic/nelsonic.github.io/master/img/hapi-chat-full-res.gif)
(_click on the image for full-screen version - this mini one looks pixelated ...!_)

## Why?

Node.js Chat Apps are practically the "Hello World" of real-time apps.
If you Google for
"[node.js chat example](https://www.google.pt/search?q=node.js+chat+example)"
you will see *thousands* of results! But ... 90% of the examples use Express.js,
95% use MongoDB to store data/messages and **100% don't have any tests**.
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
+ **Socket.io** (WebSockets with fallback for older clients) - If you're new to Soecket.io see: http://socket.io/get-started/chat/
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
for their name each time they open the chat window. (_this is pretty standard_)

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
We use:
+ **m** for the key of the **message**.
+ **n** for the **name** of the person who wrote the message
+ **t** for the **timestamp** the message was *received* by the node server (_to avoid time-zone issues_);

## Run it!

```sh
export PORT=8000
```


## Background Reading

+ **Matt Harrison** has *basic example*, but ***no tests*** (*bad habits ...*):
http://matt-harrison.com/using-hapi-js-with-socket-io
+ **Scalability**: https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling
+ Difference between scaling horizontally and vertically for databases:
http://stackoverflow.com/questions/11707879/difference-between-scaling-horizontally-and-vertically-for-databases
+ Using Pub/Sub for Asynchronous Communication:
http://www.rediscookbook.org/pubsub_for_asynchronous_communication.html
+ How to use redis PUBLISH/SUBSCRIBE with nodejs to notify clients when data values change? http://stackoverflow.com/questions/4441798/how-to-use-redis-publish-subscribe-with-nodejs-to-notify-clients-when-data-value (_don't you **love** it when someone else has aready asked/answered your questions...?)
+ node_redis pub/sub example: https://github.com/mranney/node_redis/blob/master/examples/pub_sub.js
+ Redis PubSub example using express (_no tests_!): https://github.com/rajaraodv/redispubsub
