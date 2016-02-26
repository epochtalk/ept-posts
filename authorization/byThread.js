var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsByThread(server, auth, threadId) {
  // try mode on
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }

  // access board
  var access = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
    args: [threadId, server.plugins.acls.getUserPriority(auth)]
  });

  // view deleted
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeleted.admin');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeleted.mod');
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
