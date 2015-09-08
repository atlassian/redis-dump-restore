# redis-dump-restore

This is a library for [Node.js](https://nodejs.org/) / [io.js](https://iojs.org) to dump and restore [Redis](http://redis.io) contents
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

const clientInstance = redis.createClient('localhost', 6379, { detect_buffers: true });
const dumpEx = dump(clientInstance, '*');

dumpEx
  .on('data', function (key, data, ttl) {
    // Do something with data.
    // Both key and data are Buffers.
    // ttl is 0 if key expiration is not set, otherwise it is a positive value in milliseconds.
  })
  .on('error', function (err) {
    // Handle error
   })
  .on('end', function () {
    // We're done!
  });
```
