var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsByThread(server, auth, threadId) {
  // try mode on
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }
  var error = Boom.notFound();

  // access board
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
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
      // is board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, priority]
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: some
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // view deleted
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.all');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var viewDeleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([access, viewDeleted])
  .then((data) => { return data[1]; });
};
