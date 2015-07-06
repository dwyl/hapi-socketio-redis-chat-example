# Hapi.js Socket.io Redis Chat Example

A basic chat application built with Hapi.js Socket.io and Redis Pub/Sub

## Why

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


## How

+ **Hapi.js** (node.js web framework) - If you haven't used Hapi.js before, checkout our introductory tutorial: https://github.com/nelsonic/learn-hapi
+ **Socket.io** (WebSockets with fallback for older clients) - If you're new to Soecket.io see: http://socket.io/get-started/chat/
+ **Redis** (message storage and pub/sub) - If you are *completely* new to Redis, see: https://github.com/dwyl/learn-redis


## Background Reading

+ **Matt Harrison** has *basic example*, but ***no tests*** (*bad habits*):
http://matt-harrison.com/using-hapi-js-with-socket-io
