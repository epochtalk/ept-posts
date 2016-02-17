var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsDelete(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  // is post alright to delete
  var hasSMPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated');
  var isThreadModerated = server.db.posts.isPostsThreadModerated(postId);
  var isThreadOwner = server.db.posts.isPostsThreadOwner(postId, userId);
  var deleteCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedDelete.all'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    {
      // is board mod
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedDelete.some')
    },
    Promise.join(isThreadModerated, isThreadOwner, hasSMPrivilege, function(threadSM, owner, userSM) {
      if (threadSM && owner && userSM) { return true; }
      else { return Promise.reject(Boom.forbidden()); }
    })
  ];
  var deleted = server.authorization.stitch(Boom.forbidden(), deleteCond, 'any');

  // access board with post id
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
  var access = server.authorization.stitch(Boom.notFound(), accessCond, 'any');

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
      method: server.db.posts.getPostsThread,
      args: [postId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some')
    }
  ];
  var locked = server.authorization.stitch(Boom.forbidden(), lockedCond, 'any');

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  return Promise.all([notFirst, deleted, access, locked, active]);
};
