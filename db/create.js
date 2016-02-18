var dbc = require('epochtalk-core-pg')({ conString: process.env.DATABASE_URL });
var Promise = require('bluebird');
var CreationError = Promise.OperationalError;
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(post) {
  post = helper.deslugify(post);
  var q, params;
  q = 'INSERT INTO posts(thread_id, user_id, title, body, raw_body, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING id, created_at';
  params = [post.thread_id, post.user_id, post.title, post.body, post.raw_body];
  return using(db.createTransaction(), function(client) {
    return client.queryAsync(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        post.id = results.rows[0].id;
        post.created_at = results.rows[0].created_at;
      }
      else { throw new CreationError('Post Could Not Be Saved'); }
    });
  })
  .then(function() { return helper.slugify(post); });
};
