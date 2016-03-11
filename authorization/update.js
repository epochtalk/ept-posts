var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsUpdate(server, auth, postId, threadId) {
  var userId = auth.credentials.id;
  var error = Boom.forbidden();

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.update.allow'
  });

  // is post owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.owner.admin'
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
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.owner.mod')
    }
  ];
  var owner = server.authorization.stitch(error, ownerCond, 'any');

  // can write to post
  var deletedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.deleted.admin'
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
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.deleted.mod')
    }
  ];
  var deleted = server.authorization.stitch(error, deletedCond, 'any');

  // is thread locked
  var lockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.locked.admin'
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
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.locked.mod')
    }
  ];
  var locked = server.authorization.stitch(error, lockedCond, 'any');

  // access board
  var access = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.posts.getPostsBoardInBoardMapping,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });

  // -- is User Account Active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  // final promise
  return Promise.all([allowed, owner, deleted, access, locked, active]);
};
