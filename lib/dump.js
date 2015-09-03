'use strict';

const EE = require('events').EventEmitter;

module.exports = function dump (client, pattern) {
  const r = new EE();

  setImmediate(function () {
    client.keys(pattern || '*', function (err, keys) {
      if (isError(err)) {
        r.emit('error', err);
        return;
      }

      processNextKey();

      function processNextKey () {
        if (!keys.length) {
          r.emit('end');
          return;
        }
        const key = keys.pop();
        client.dump(key, function (err, data) {
          if (isError(err)) {
            r.emit('error', err);
            return;
          }
          client.pttl(key, function (err, ttl) {
            if (isError(err)) {
              r.emit('error', err);
              return;
            }
            if (ttl === -2) {
              // Key disappeared, just skip it
            } else if (ttl >= -1) {
              r.emit('data', key, data, ttl);
            } else {
              r.emit('error', new Error(`Unexpected return value from PTTL command '${ttl}' for key '${key}'`));
              return;
            }
            processNextKey();
          });
        });
      }
    });
  });

  return r;
};

function isError (e) {
  return e !== null && typeof e !== 'undefined';
}
