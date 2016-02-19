var _ = require('lodash');
var Promise = require('bluebird');

var common = {};
module.exports = common;

common.clean = clean;
common.parse = parse;
common.cleanPosts = cleanPosts;

common.export = () =>  {
  return [
    {
      name: 'common.posts.clean',
      method: clean,
      options: { callback: false }
    },
    {
      name: 'common.posts.parse',
      method: parse,
      options: { callback: false }
    }
  ];
};

common.apiExport = () => {
  return { format: cleanPosts  };
};

function clean(sanitizer, payload) {
  payload.title = sanitizer.strip(payload.title);
  payload.raw_body = sanitizer.bbcode(payload.raw_body);
}

function parse(parser, payload) {
  payload.body = parser.parse(payload.raw_body);

  // check if parsing was needed
  if (payload.body === payload.raw_body) { payload.raw_body = ''; }
}

/**
 *  ViewContext can be an array of boards or a boolean
 */
function cleanPosts(posts, currentUserId, viewContext) {
  posts = [].concat(posts);
  var viewables = viewContext;
  var viewablesType = 'boolean';
  var boards = [];
  if (_.isArray(viewContext)) {
    boards = viewContext.map(function(vd) { return vd.board_id; });
    viewablesType = 'array';
  }

  return posts.map(function(post) {

    // if currentUser owns post, show everything
    var viewable = false;
    if (currentUserId === post.user.id) { viewable = true; }
    // if viewables is an array, check if user is moderating this post
    else if (viewablesType === 'array' && _.includes(boards, post.board_id)) { viewable = true; }
    // if viewables is a true, view all posts
    else if (viewables) { viewable = true; }

    // remove deleted users or post information
    var deleted = false;
    if (post.deleted || post.user.deleted || post.board_visible === false) { deleted = true; }

    // format post
    if (viewable && deleted) { post.hidden = true; }
    else if (deleted) {
      post = {
        id: post.id,
        hidden: true,
        _deleted: true,
        thread_title: 'deleted',
        user: {}
      };
    }

    if (!post.deleted) { delete post.deleted; }
    delete post.board_visible;
    delete post.user.deleted;
    return post;
  });
}
