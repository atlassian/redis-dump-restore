'use strict';

const dumpLib = require('../index');
const redis = require('redis');
const uuid = require('node-uuid');

for (let method of ['dump', 'dumpMulti']) {
  describe(method, function () {

    let client;
    let key1, key2;

    beforeEach(function () {
      client = redis.createClient({ detect_buffers: true });
      key1 = new Buffer(uuid.v4() + '-random-test-key1');
      key2 = new Buffer(uuid.v4() + '-random-test-key2');
    });

    afterEach(function (done) {
      client.del(key1, function (err1) {
        client.del(key2, function (err2) {
          client.quit();
          done(err1 || err2);
        });
      });
    });

    it('should emit dumped values', function (done) {
      client.set(key1, uuid.v4(), 'EX', 5, function (err) {
        if (err) {
          done(err);
          return;
        }
        client.set(key2, uuid.v4(), 'EX', 5, function (err) {
          if (err) {
            done(err);
            return;
          }

          let data1Called = false, data2Called = false;
          dumpLib[method](client)
            .on('data', function (key, data, ttl) {
              if (key.equals(key1)) {
                data.should.be.not.null;
                ttl.should.be.not.null;
                data1Called = true;
              } else if (key.equals(key2)) {
                data.should.be.not.null;
                ttl.should.be.not.null;
                data2Called = true;
              }
            })
            .on('error', done)
            .on('end', function () {
              data1Called.should.be.true;
              data2Called.should.be.true;
              done();
            });
        });
      });
    });

  });
}
