var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var common = require(path.normalize(__dirname + '/common'));
var authorization = require(path.normalize(__dirname + '/authorization'));

module.exports = {
  name: 'posts',
  version: '1.0.0',
  api: common,
  authorization: authorization,
  permissions: permissions,
  common: common,
  routes: routes
};

var permissions = {
  privilegedUpdate: {
    some: [true, false],
    all: [true, false]
  },
  privilegedDelete: {
    some: [true, false],
    all: [true, false]
  },
  privilegedPurge: {
    some: [true, false],
    all: [true, false]
  },
  viewDeleted: {
    some: [true, false],
    all: [true, false]
  },
  bypassLock: {
    some: [true, false],
    all: [true, false]
  },
  create: [true, false],
  find: [true, false],
  byThread: [true, false],
  update: [true, false],
  delete: [true, false],
  undelete: [true, false],
  purge: [true, false],
  pageByUser: [true, false]
};

var futurePermissions = {
  create: ['admin', 'mod', 'user', 'none'],
  find: ['admin', 'mod', 'user', 'none'],
  byThread: ['admin', 'mod', 'user', 'none'],
  update: ['admin', 'mod', 'user', 'none'],
  delete: ['admin', 'mod', 'user', 'none'],
  purge: ['admin', 'mod', 'user', 'none'],
  pageByUser: ['admin', 'mod', 'user', 'none'],
  bypassLock: ['admin', 'mod'],
  bypassBoard: ['admin', 'mod'],
};
