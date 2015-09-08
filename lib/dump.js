'use strict';

const EE = require('events').EventEmitter;

module.exports.dump = function dump (client, pattern) {
  const r = new EE();

  setImmediate(function () {
    client.keys(new Buffer(pattern || '*'), function (err, keys) {
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
            if (handleItem(r, key, data, ttl)) {
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

module.exports.dumpMulti = function dumpMulti (client, pattern) {
  const r = new EE();

  setImmediate(function () {
    client.keys(new Buffer(pattern || '*'), function (err, keys) {
      if (isError(err)) {
        r.emit('error', err);
        return;
      }

      const multi = client.multi();

      for (let key of keys) {
        multi.dump(key);
        multi.pttl(key);
      }

      multi.exec(function (errs, replies) {
        if (isError(errs)) {
          for (let err of errs) {
            if (err !== null) {
              r.emit('error', err);
              return;
            }
          }
        }
        let k = 0;
        for (let i = 0, len = replies.length; i < len;) {
          const key = keys[k++];
          const data = replies[i++];
          const ttl = replies[i++];
          if (handleItem(r, key, data, ttl)) {
            return;
          }
        }
        r.emit('end');
      });
    });
  });

  return r;
};

function handleItem (r, key, data, ttl) {
  ttl = parseInt(ttl.toString(), 10);
  if (ttl === -2 || ttl === 0) {
    // Key disappeared or expired, just skip it
  } else if (ttl >= -1) {
    if (ttl === -1) {
      ttl = 0;
    }
    r.emit('data', key, data, ttl);
  } else {
    r.emit('error', new Error(`Unexpected return value from PTTL command '${ttl}' for key '${key}'`));
    return true;
  }
  return false;
}

function isError (e) {
  return e !== null && typeof e !== 'undefined';
}
