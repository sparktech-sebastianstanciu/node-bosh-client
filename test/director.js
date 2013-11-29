var assert          = require('assert'),
    EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    btoa            = require('btoa');


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
        },
        deploymentName = 'test-deployment',
        propertyName = 'test',
        propertyValue = 'true';

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

    it('should query BOSH for a single release\'s info', function (done) {
        client.getRelease('test', function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'releases/test'});
            done();
        });
    });

    it('should call BOSH to delete a release', function (done) {
        var name = 'testing',
            opt = {force: true, version: 11};
        client.deleteRelease(name, opt, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                method: 'DELETE',
                url: boshUrl + util.format('releases/%s', name),
                qs: opt,
                followRedirect: false
            });
            done();
        });
    });

    it('should call BOSH to create a deployment', function (done) {
        var yml = 'name: testing\n' +
        'director_uuid: 0a00a000-00aa-0000-0aaa-00000000a000';
        client.deploy(btoa(yml), function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                headers: {
                    'Content-Type': 'text/yaml',
                    authorization: 'Basic ' + userToken
                },
                method: 'POST',
                url: boshUrl + 'deployments',
                body: yml,
                followRedirect: false
            });
            done();
        });
    });

    it('should call BOSH to delete a deployment', function (done) {
        var deployment = 'testing',
            force = false;
        client.deleteDeployment(deployment, force, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                method: 'DELETE',
                url: boshUrl + 'deployments/' + deployment,
                followRedirect: false
            });
            done();
        });
    });

    it('should query BOSH for a list of recent tasks', function (done) {
        var limit = 11,
            verbose = 0;
        client.getRecentTasks(limit, verbose, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {url: boshUrl + 'tasks',
            qs: {limit: limit, verbose: verbose}});
            done();
        });
    });

    it('should query BOSH for a list of running tasks', function (done) {
        var verbose = 0;
        client.getRunningTasks(verbose, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, { url: boshUrl + 'tasks',
                qs: {verbose: verbose,
                    state: ['processing', 'cancelling', 'queued']}});
            done();
        });
    });

    it('should call BOSH to delete a stemcell', function (done) {
        var force = true,
            name = 'test-1',
            version = 2;

        client.deleteStemcell(name, version, force, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {qs: {force: true},
                method: 'DELETE',
                followRedirect: false,
                url: boshUrl +
                util.format('stemcells/%s/%s', name, version)});
            done();
        });
    });

    it('should call BOSH to create a deployment property', function (done) {
        client.createProperty(deploymentName, propertyName, propertyValue,
        function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                method: 'POST',
                body: JSON.stringify({name: propertyName,
                    value: propertyValue}),
                url: boshUrl + util.format('deployments/%s/properties',
                    deploymentName)
            });
            done();
        });
    });

    it('should call BOSH to get a deployment property', function (done) {
        client.getProperty(deploymentName, propertyName, function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                url: boshUrl + util.format('deployments/%s/properties/%s',
                    deploymentName, propertyName)
            });
            done();
        });
    });

    it('should call BOSH to update a deployment property', function (done) {
        propertyValue = 'false';

        client.updateProperty(deploymentName, propertyName, propertyValue,
        function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                method: 'PUT',
                url: boshUrl + util.format('deployments/%s/properties/%s',
                deploymentName, propertyName),
                body: JSON.stringify({value: propertyValue})
            });
            done();
        });
    });

    it('should call BOSH to delete a deployment property', function (done) {
        client.deleteProperty(deploymentName, propertyName,
            function (err, body) {
            assert(!err, err);
            assert.deepEqual(requestOptions, {
                url: boshUrl + util.format('deployments/%s/properties/%s',
                    deploymentName, propertyName),
                method: 'DELETE'
            });
            done();
        });
    });

});