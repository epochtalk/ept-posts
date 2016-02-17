var Boom = require('boom');
var Promise = require('bluebird');
var querystring = require('querystring');

module.exports = function postsPageByUser(server, auth, username) {
  // try mode on: must check user is authed

  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

  // access user
  var accessCond = [
    {
      // is the user account we're looking for active
      type: 'isAccountActive',
      server: server,
      username: querystring.unescape(username),
      userId: userId
    },
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'users.viewDeleted'
    }
  ];
  var access = server.authorization.stitch(Boom.notFound(), accessCond, 'any');

  // user priority
  var priority = server.plugins.acls.getUserPriority(auth);

  // view deleted profile posts
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.all');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var deleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([access, priority, deleted])
  .then((data) => { return { priority: data[1], viewables: data[2] }; });
};
