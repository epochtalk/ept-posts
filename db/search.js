var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var querystring = require('querystring');

module.exports = function(opts) {
  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;

  opts.desc = opts.desc ? 'DESC' : 'ASC';
  opts.search = opts.search || undefined;
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  var q = 'SELECT * FROM (SELECT p.id, ts_headline(\'simple\', p.title, q, \'StartSel=<mark>, StopSel=</mark>\') as thread_title, p.user_id, p.created_at, u.username, p.thread_id, p.position, ts_headline(\'simple\', p.body, q, \'StartSel=<mark>, StopSel=</mark>\') as body, t.board_id, b.name AS board_name FROM posts p, users u, threads t, boards b, plainto_tsquery(\'simple\', $1) AS q WHERE (p.tsv @@ q) AND (p.user_id = u.id) AND (p.thread_id = t.id) AND (t.board_id = b.id) LIMIT $2 OFFSET $3) as s ORDER BY s.created_at DESC';

  // Calculate pagination vars
  var offset = (page * limit) - limit;
  limit = limit + 1; // query one extra result to see if theres another page

  var params = [querystring.unescape(opts.search), limit, offset];
  if (!opts.search) {
    q = 'SELECT LIMIT 0';
    params = undefined;
  }

  return db.sqlQuery(q, params)
  .then(function(data) {
    // Check for next page then remove extra record
    if (data.length === limit) {
      results.next = page + 1;
      data.pop();
    }
    results.posts = helper.slugify(data);
    return results;
  });
};

