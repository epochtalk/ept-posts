var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsFind(server, auth, postId) {
  // try mode on: must check user is authed
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }

  // access board
  var access = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.posts.getPostsBoardInBoardMapping,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });

  // view deleted
  var deletedCond = [
    server.authorization.build({
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.find.bypass.viewDeleted.admin'
    }),
    server.authorization.build({
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args:[userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.find.bypass.viewDeleted.mod')
    })
  ];

  var deleted = Promise.any(deletedCond)
  .then(() => { return true; })
  .catch(() => { return false; });

  // final promise
  return Promise.all([access, deleted])
  .then((dataArr) => { return dataArr[1]; });
};
