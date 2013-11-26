var nock = require('nock');

nock('http://api.bosh.local.me')
  .get('/info')
  .reply(200, "{}", { server: 'nginx',
  date: 'Wed, 21 Aug 2013 10:14:33 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"12d345a67b8901eeda23fa456789b0e1"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });

nock('http://api.bosh.local.me')
  .get('/stemcells')
  .reply(200, "{}", { server: 'nginx',
  date: 'Wed, 21 Aug 2013 10:14:33 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"12d345a67b8901eeda23fa456789b0e1"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });
