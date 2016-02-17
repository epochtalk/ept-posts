var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsUpdate(server, auth, postId, threadId) {
  var userId = auth.credentials.id;
  var error = Boom.forbidden();

  // is post owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedUpdate.all'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedUpdate.some')
    }
  ];
  var owner = server.authorization.stitch(error, ownerCond, 'any');

  // can write to post
  var writeCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedUpdate.all'
    },
    {
      // is post not deleted
      type: 'dbNotProp',
      method: server.db.posts.find,
      args: [postId],
      prop: 'deleted'
    },
    {
      // is board moderator
      type: 'isMod',
      method:  server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedUpdate.some')
    }
  ];
  var writer = server.authorization.stitch(error, writeCond, 'any');

  // access board
  var accessCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.posts.getPostsBoardInBoardMapping,
      args: [postId, server.plugins.acls.getUserPriority(auth)]
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // is thread locked
  var lockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.bypassLock.all'
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some')
    }
  ];
  var locked = server.authorization.stitch(error, lockedCond, 'any');

  // -- is User Account Active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([owner, writer, access, locked, active]);
};
