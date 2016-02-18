var dbc = require('epochtalk-core-pg')({ conString: process.env.DATABASE_URL });
var Promise = require('bluebird');
var NotFoundError = Promise.OperationalError;
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(postId, userPriority) {
  postId = helper.deslugify(postId);
  var q = 'SELECT t.board_id FROM posts p LEFT JOIN threads t ON p.thread_id = t.id WHERE p.id = $1';
  return db.sqlQuery(q, [postId])
  .then(function(rows) {
    if (rows.length > 0 ) { return rows[0].board_id; }
    else { throw new NotFoundError(); }
  })
  .then(function(boardId) {
    var q = 'WITH RECURSIVE find_parent(board_id, parent_id, category_id) AS ( ';
    q += 'SELECT bm.board_id, bm.parent_id, bm.category_id ';
    q += 'FROM board_mapping bm where board_id = $1 ';
    q += 'UNION ';
    q += 'SELECT bm.board_id, bm.parent_id, bm.category_id ';
    q += 'FROM board_mapping bm, find_parent fp ';
    q += 'WHERE bm.board_id = fp.parent_id ';
    q += ') ';
    q += 'SELECT fp.board_id, fp.parent_id, fp.category_id, b.viewable_by as board_viewable, c.viewable_by as cat_viewable ';
    q += 'FROM find_parent fp ';
    q += 'LEFT JOIN boards b on fp.board_id = b.id ';
    q += 'LEFT JOIN categories c on fp.category_id = c.id';
    return db.sqlQuery(q, [boardId])
    .then(function(rows) {
      if (rows.length < 1) { return false; }

      var boardVisible = false;
      var catVisible = false;
      var board_viewable = rows[0].board_viewable;
      var cat_viewable = rows[rows.length - 1].cat_viewable;

      if (board_viewable !== 0 && !board_viewable) { boardVisible = true; }
      else if (userPriority <= board_viewable) { boardVisible = true; }

      if (cat_viewable !== 0 && !cat_viewable) { catVisible = true; }
      else if (userPriority <= cat_viewable) { catVisible = true; }

      return boardVisible && catVisible;
    });
  })
  .error(function() { return false; });
};
