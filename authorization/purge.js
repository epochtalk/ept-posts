var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsPurge(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  var purgeCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedPurge.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedPurge.some')
    }
  ];
  var purge = server.authorization.stitch(Boom.forbidden(), purgeCond, 'any');

  return Promise.all([notFirst, purge]);
};
