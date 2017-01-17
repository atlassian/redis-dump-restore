# redis-dump-restore

[![NPM](https://nodei.co/npm/redis-dump-restore.png)](https://npmjs.org/package/redis-dump-restore)

[![NPM](https://nodei.co/npm-dl/redis-dump-restore.png)](https://nodei.co/npm-dl/redis-dump-restore/)

[![Build Status](https://travis-ci.org/atlassian/redis-dump-restore.svg?branch=master)](https://travis-ci.org/atlassian/redis-dump-restore)
[![Coverage Status](https://coveralls.io/repos/atlassian/redis-dump-restore/badge.svg?branch=master&service=github)](https://coveralls.io/github/atlassian/redis-dump-restore?branch=master)

This is a library for [Node.js](https://nodejs.org/) to dump and restore [Redis](http://redis.io) contents
using [DUMP](http://redis.io/commands/DUMP) and [RESTORE](http://redis.io/commands/RESTORE) commands.

It issues those commands using the [redis](https://www.npmjs.com/package/redis) npm package. You have to provide
instance of the client yourself. Make sure to set `return_buffers` and/or `detect_buffers` to `true`
(see [docs](https://www.npmjs.com/package/redis#overloading)) so that we get
[Buffer](https://nodejs.org/api/buffer.html) instances from the client.
This is required because otherwise binary data is corrupted. Use 1.0.0+ version of the `redis` library - previous
versions have bugs in `detect_buffers` handling.

## Dependencies

No production-time dependencies. For the list of test-time dependencies and their versions see the `package.json` file.

## Usage

```JavaScript
const redis = require('redis');
const dump = require('@atlassian/redis-dump-restore').dump;
// Use this function to DUMP all values atomically (inside MULTI)
//const dump = require('@atlassian/redis-dump-restore').dumpMulti;

const clientInstance = redis.createClient('localhost', 6379, { detect_buffers: true });
const dumpEx = dump(clientInstance, '*');

dumpEx
  .on('data', function (key, data, ttl) {
    // Do something with data.
    // Both key and data are Buffers with binary data.
    // ttl is 0 if key expiration is not set, otherwise it is a positive value in milliseconds.
  })
  .on('error', function (err) {
    // Handle error
   })
  .on('end', function () {
    // We're done!
  });
```

To restore a dump just use the `redis` client's `restore` command for each saved key. You can do that as a single
[transaction](http://redis.io/topics/transactions) if needed using [MULTI](http://redis.io/commands/MULTI).

## Install instructions

In your project directory run the following command to add this library as a dependency:

```shell
npm install redis-dump-restore --save
```
