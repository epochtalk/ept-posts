var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsCreate(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to locked thread with thread id
  var lockCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.create.bypass.admin'
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
      permission: server.plugins.acls.getACLValue(auth, 'posts.create.bypass.mod')
    }
  ];
  var locked = server.authorization.stitch(Boom.forbidden('Thread Is Locked'), lockCond, 'any');

  // Access to board with thread id
  var access = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
    args: [threadId, server.plugins.acls.getUserPriority(auth)]
  });

  // is requester active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  // final promise
  return Promise.all([access, locked, active]);
};
