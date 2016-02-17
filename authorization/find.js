var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsFind(server, auth, postId) {
  // try mode on: must check user is authed
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }
  var error = Boom.notFound();

  // access board
  var accessSome = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
  var priority = server.plugins.acls.getUserPriority(auth);
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
      permission: accessSome
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.posts.getPostsBoardInBoardMapping,
      args: [postId, priority]
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // view deleted
  var deletedSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var deletedCond = [
    server.authorization.build({
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.viewDeleted.all'
    }),
    server.authorization.build({
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args:[userId, postId],
      permission: deletedSome
    })
  ];

  var deleted = Promise.any(deletedCond)
  .then(() => { return true; })
  .catch(() => { return false; });

  // final promise
  return Promise.all([access, deleted])
  .then((dataArr) => { return dataArr[1]; });
};
