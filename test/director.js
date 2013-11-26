var assert = require('assert'),
    EventEmitter = require('events').EventEmitter;

describe('Director', function () {
    var mockery,
        client,
        Director,
        requestOptions,
        requestCallback,
        requests = new EventEmitter(),
        boshUrl = 'http://api.bosh.local.me/',
        user = {id: '123'},
        userToken = 'dXNlcjpzZWNyZXQ=',
        boshPort = '25555',
        boshUser = 'user',
        stageName = 'testing',
        boshPassword = 'secret',
        requestDefaults = {
            rejectUnauthorized: false,
            requestCert: true,
            headers: {
                'Content-Type': 'application/json',
                authorization: 'Basic ' + userToken
            }
        };

    before(function (done) {
        mockery = require('mockery');
        mockery.enable({ useCleanCache: true,
            warnOnUnregistered: false });

        mockery.registerMock('request', function (obj, callback) {
            requests.emit('request', obj);
            requestCallback(obj, callback);
        });

        Director = require('../lib/director');

        client = new Director({ user: user,
            userToken: userToken,
            boshPort: boshPort,
            boshUrl: boshUrl,
            boshUser: boshUser,
            boshPassword: boshPassword,
            stageName: stageName
        });

        requestCallback = function (obj, callback) {
            callback(null, { statusCode: 200 });
        };

        requests.addListener('request', function (options) {
            requestOptions = options;
        });
        
        done();
    });

    after(function (done) {
        mockery.disable();
        requests.removeAllListeners();
        done();
    });

    it('should query BOSH for status info', function (done) {
        client.getStatus(function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'info'});
            done();
        });
    });

    it('should query BOSH for stemcell info', function (done) {
        client.stemcells(function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'stemcells'});
            done();
        });
    });

    it('should query BOSH for release info', function (done) {
        client.getReleases(function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'releases'});
            done();
        });
    });

    it('should query BOSH for deployments info', function (done) {
        client.getDeployments(function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'deployments'});
            done();
        });
    });

});