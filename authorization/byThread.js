var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsByThread(server, auth, threadId) {
  // try mode on
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.byThread.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
    args: [threadId, server.plugins.acls.getUserPriority(auth)]
  });

  // view deleted posts
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.admin');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.mod');
  var viewDeleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([allowed, read, viewDeleted])
  .then((data) => { return data[2]; });
};
