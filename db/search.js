var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var order = opts.sortDesc ? 'DESC' : 'ASC';
  var search = opts.searchStr;

  var result = {};
  var q = 'SELECT p.*, (SELECT username from users where id = p.user_id) as username, (SELECT p2.title FROM posts p2 WHERE p2.thread_id = p.thread_id ORDER BY created_at LIMIT 1) as thread_title, b.id as board_id, b.name as board_name from posts p LEFT JOIN boards b ON ((SELECT t.board_id FROM threads t WHERE p.thread_id = t.id)  = b.id) WHERE body LIKE \'% ' + search + ' %\' ORDER BY p.created_at DESC LIMIT $1 OFFSET $2';
  var params = [limit, offset];
    if (!search) {
      q = 'SELECT LIMIT 0';
      params = undefined;
    }

  return db.sqlQuery(q, params)
  .then(function(posts) {
    result.posts = posts;
    if (posts.length) {
      result.posts = result.posts.map(function(item) {
        item.user = { username: item.username };
        delete item.username;
        var find = ' ' + opts.searchStr + ' ';
        var re = new RegExp(find, 'g');
        item.body = item.body.replace(re, '<div class="highlighted"> ' + opts.searchStr + ' </div>');
        return item;
      });
    }
    return { count: posts.length };
  })
  .then(function(postCount) {
    result.count = Number(postCount.count) || 0;
    result.page = page;
    result.limit = limit;
    result.desc = order === 'DESC';
    result.search = opts.searchStr;
    result.page_count =  Math.ceil(postCount.count / limit);
    return result;
  })
  .then(helper.slugify);
};
