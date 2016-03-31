var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, opts) {
  threadId = helper.deslugify(threadId);
  var columns = 'plist.id, post.thread_id, post.board_id, post.user_id, post.title, post.body, post.raw_body, post.position, post.deleted, post.created_at, post.updated_at, post.imported_at, post.username, post.user_deleted, post.signature, post.avatar, post.name, p2.highlight_color, p2.role_name';
  var q2 = 'SELECT p.thread_id, t.board_id, p.user_id, p.title, p.body, p.raw_body, p.position, p.deleted, p.created_at, p.updated_at, p.imported_at, u.username, u.deleted as user_deleted, up.signature, up.avatar, up.fields->\'name\' as name FROM posts p ' +
    'LEFT JOIN users u ON p.user_id = u.id ' +
    'LEFT JOIN users.profiles up ON u.id = up.user_id ' +
    'LEFT JOIN threads t ON p.thread_id = t.id ' +
    'WHERE p.id = plist.id';
  var q3 = 'SELECT r.priority, r.highlight_color, r.name as role_name FROM roles_users ru ' +
    'LEFT JOIN roles r ON ru.role_id = r.id ' +
    'WHERE post.user_id = ru.user_id ' +
    'ORDER BY priority limit 1';

  opts = opts || {};
  var start = opts.start || 0;
  var limit = opts.limit || 25;

  // get total post count for this thread
  var q = 'SELECT id FROM posts WHERE thread_id = $1 AND position > $2 ORDER BY position LIMIT $3';
  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) plist LEFT JOIN LATERAL ( ' +
    q2 + ' ) post ON true LEFT JOIN LATERAL ( ' +
    q3 + ' ) p2 ON true';
  var params = [threadId, start, limit];
  return db.sqlQuery(query, params)
  .map(common.formatPost)
  .then(helper.slugify);
};
