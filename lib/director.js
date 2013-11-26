require('sugar');

var url                 = require('url'),
    util                = require('util'),
    request             = require('request');

var DirectorClient = module.exports = function (info) {
    this.boshUrl = (info.boshUrl || '');
    this.info = info;

    if (! info.boshPort) {
        return new TypeError('port must be provided');
    }

    var token = function () {
        if (info.boshUser && info.boshPassword) {
            return new Buffer(util.format('%s:%s',
                info.boshUser, info.boshPassword)).toString('base64');
        } else {
            return '';
        }
    };

    var basicToken = function () {
        return util.format('Basic %s', token());
    };

    var self = this;

    request.defaults({
        headers: {
            'Content-Type': 'application/json',
            authorization: basicToken(),
        },
        rejectUnauthorized: false,
        requestCert: true,
    });

    this.vms = function (stage, callback) {
        var self = this;
        request({
            followRedirect: false,
            url: self.boshUrl + [ 'deployments',
                stage, 'vms' ].join('/') + '?format=full',
            method: 'GET'
        }, function (error, res) {
                if (res.headers && res.headers.location) {
                    var taskId = res.headers.location.match(/tasks\/(\d+)/);
                    if (taskId) {
                        taskId = taskId[1];
                        self.trackTask(taskId, callback);
                    } else {
                        callback({message: {description:
                          'No task url received'}, statusCode: 400});
                    }
                } else {
                    callback(error, res);
                }
            });
    };

    this.trackTask = function (taskId, callback) {
        var fullUrl = this.boshUrl + ['tasks', taskId].join('/'),
            self = this;
        var pid = setInterval(
          function () {
                request({
                    url: fullUrl,
                }, function (error, res, body) {
                    if (body) {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            // Do Nothing
                        }
                    }
                    if (error) {
                        clearInterval(pid);
                        callback(error);
                    } else if (body && body.state === 'done') {
                        clearInterval(pid);
                        self.getTaskOutput(taskId, 'result', callback);
                    }
                });
            }, 1500);
    };

    this.getTaskOutput = function (taskId, logType, callback) {
        var fullUrl = this.boshUrl + ['tasks', taskId, 'output'].join('/');
        if (logType) {
            fullUrl += util.format('?type=%s', logType);
        }
        request({
            url: fullUrl
        }, function (error, result, body) {
            callback(error, body);
        });
    };

    this.getStatus = function (callback)  {
        request({
            url: this.boshUrl + 'info'
        }, function (error, result, body) {
            callback(error, body);
        });
    };
  
    this.stemcells = function (callback) {
        request({
            url: this.boshUrl + 'stemcells'
        }, function (error, result, body) {
            callback(error, body);
        });
    };

    this.getReleases = function (callback) {
        request({
            url: this.boshUrl + 'releases'
        }, function (error, result, body) {
            callback(error, body);
        });
    };

    this.getDeployments = function (callback) {
        request({
            url: this.boshUrl + 'deployments'
        }, function (error, result, body) {
            callback(error, body);
        });
    };
};