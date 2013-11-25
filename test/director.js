var assert = require('assert'),
    Director = require('../lib/director');

describe('Director', function () {
  var mockery,
    client;

  before(function () {
    var boshUrl = 'http://api.bosh.me/',
        user = {id: '123'},
        userToken = 'dXNlcjpzZWNyZXQ=',
        boshPort = '25555',
        boshUser = 'user',
        stageName = 'testing',
        boshPassword = 'secret';

    mockery = require('mockery');
    mockery.enable({ useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false });

    client = new Director({ user: user,
        userToken: userToken,
        boshPort: boshPort,
        boshUrl: boshUrl,
        boshUser: boshUser,
        boshPassword: boshPassword,
        stageName: stageName
    });
  });

  after(function () {
    mockery.disable();
  });

  it('should query BOSH for status info', function(done) {
    mockery.registerMock('request', function(obj, callback) {
      assert.deepEqual(obj, {
        rejectUnauthorized: false,
        requestCert: true,
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Basic ' + userToken},
        url: boshUrl + 'info'
      });

       process.nextTick(function () {
          callback(null, { statusCode: 200 });
      });
    });

    client.getStatus(function(err, body) {
      assert(!err, err);
      done();
    });
  });

  it('should query BOSH for stemcell info', function(done) {
    mockery.registerMock('request', function(obj, callback) {
        assert.deepEqual(obj, {
          requestUnauthorized: false,
          requestCert: true,
          headers: {
            'Content-Type': 'applicaiton/json',
            authorization: 'Basic ' + userToken
          },
          url: boshUrl + 'stemcells'
        });

        process.nextTick(function () {
          callback(null, { statusCode: 200 });
      });
    });

    client.stemcells(function(err, body) {
      assert(!err, err);
      done();
    });
  });

});