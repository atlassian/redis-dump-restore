'use strict';

const dump = require('../lib/dump');

describe('dump', function () {

  let client;
  let key1;
  let value1;

  beforeEach(function () {
    client = {};
    key1 = new Buffer('key1');
    value1 = new Buffer('value1');

    client.keys = sinon.stub();
    client.dump = sinon.stub();
    client.pttl = sinon.stub();
  });

  it('should emit dumped value for each key', function (done) {
    client.keys.withArgs(new Buffer('*')).yields(null, [key1]);
    client.dump.withArgs(key1).yields(null, value1);
    client.pttl.withArgs(key1).yields(null, new Buffer('10'));

    let dataCalled = false;

    dump(client)
      .on('data', function (key, data, ttl) {
        key.should.equal(key1);
        data.should.equal(value1);
        ttl.should.equal(10);
        dataCalled = true;
      })
      .on('end', function () {
        dataCalled.should.be.true;
        done();
      })
      .on('error', done);
  });

  it('should skip value when pttl returns -2', function (done) {
    client.keys.withArgs(new Buffer('*')).yields(null, [key1]);
    client.dump.withArgs(key1).yields(null, value1);
    client.pttl.withArgs(key1).yields(null, new Buffer('-2'));

    dump(client)
      .on('data', function (key, data, ttl) {
        done(new Error(`Unexpected event: '${key}', '${data}', '${ttl}'`));
      })
      .on('end', function () {
        done();
      })
      .on('error', done);
  });

});
