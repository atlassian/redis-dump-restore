'use strict';

const dump = require('../lib/dump');
const redis = require('redis');
const uuid = require('node-uuid');

describe('dump', function () {

  let client;
  let key1;

  beforeEach(function () {
    client = redis.createClient({ detect_buffers: true });
    key1 = new Buffer(uuid.v4() + '-random-test-key');
  });

  afterEach(function (done) {
    client.del(key1, function (err) {
      client.quit();
      done(err);
    });
  });

  it('should emit dumped value', function (done) {
    client.set(key1, uuid.v4(), 'EX', 5, function (err) {
      if (err) {
        done(err);
        return;
      }
      let dataCalled = false;
      dump(client)
        .on('data', function (key, data, ttl) {
          if (key.equals(key1)) {
            data.should.be.not.null;
            ttl.should.be.not.null;
            dataCalled = true;
          }
        })
        .on('error', done)
        .on('end', function () {
          dataCalled.should.be.true;
          done();
        });
    });
  });

});
