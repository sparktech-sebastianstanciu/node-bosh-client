var  assert = require('assert');

describe('Director', function () {
    var mockery,
        client,
        Director,
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
        require('./nock');

        Director = require('../lib/director');

        client = new Director({ user: user,
            userToken: userToken,
            boshPort: boshPort,
            boshUrl: boshUrl,
            boshUser: boshUser,
            boshPassword: boshPassword,
            stageName: stageName
        });
        done();
    });

    it('should query BOSH for status info', function (done) {
        client.getStatus(function (err, body) {
            assert(!err, err);
            done();
        });
    });

    it('should query BOSH for stemcell info', function (done) {
        client.stemcells(function (err, body) {
            assert(!err, err);
            done();
        });
    });

    it('should query BOSH for release info', function (done) {
        client.getReleases(function (err, body) {
            assert(!err, err);
            done();
        });
    });

    it('should query BOSH for deployments info', function (done) {
        client.getDeployments(function (err, body) {
            assert(!err, err);
            done();
        });
    });

});