var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsCreate(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var priority = server.plugins.acls.getUserPriority(auth);
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, priority]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: some
    }
  ];
  var access = server.authorization.stitch(Boom.notFound('Board Not Found'), accessCond, 'any');

  // Access to locked thread with thread id
  var tlSome = server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some');
  var lockCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.bypassLock.all'
    },
    {
      // thread not locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
    {
      // is user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: tlSome
    }
  ];
  var locked = server.authorization.stitch(Boom.forbidden('Thread Is Locked'), lockCond, 'any');

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([access, locked, active]);
};
