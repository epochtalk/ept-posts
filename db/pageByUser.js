var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(username, priority, opts) {
  var q = 'SELECT p.id, p.thread_id, p.user_id, p.raw_body, p.body, p.position, p.deleted, u.deleted as user_deleted, p.created_at, p.updated_at, p.imported_at, b.id as board_id, ' + 'EXISTS (SELECT 1 FROM boards WHERE board_id = b.id AND (b.viewable_by >= $2 OR b.viewable_by IS NULL)) as board_visible, ' +
    '(SELECT p2.title FROM posts p2 WHERE p2.thread_id = p.thread_id ORDER BY p2.created_at LIMIT 1) as thread_title ' +
    'FROM posts p ' +
    'LEFT JOIN users u ON p.user_id = u.id ' +
    'LEFT JOIN threads t ON p.thread_id = t.id ' +
    'LEFT JOIN boards b ON t.board_id = b.id ' +
    'WHERE u.username = $1 ORDER BY';
  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var sortField = opts.sortField || 'created_at';
  var order = opts.sortDesc ? 'DESC' : 'ASC';
  var offset = (page * limit) - limit;
  q = [q, sortField, order, 'LIMIT $3 OFFSET $4'].join(' ');
  var params = [username, priority, limit, offset];
  return db.sqlQuery(q, params)
  .map(common.formatPost)
  .then(helper.slugify);
};
