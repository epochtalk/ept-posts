var _ = require('lodash');
var cheerio = require('cheerio');

module.exports = {
  createImageReferences: createImageReferences,
  updateImageReferences: updateImageReferences,
  cleanPosts: cleanPosts
};

// TODO: this should be moved to imageStore
function createImageReferences (request, post) {
  // load html in post.body into cheerio
  var html = post.body;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var images = [];
  $('img').each(function(index, element) {
    images.push(element);
  });

  // save all images with a reference to post
  images.map(function(element) {
    var imgSrc = $(element).attr('src');
    request.imageStore.addPostImageReference(post.id, imgSrc);
  });

  return post;
}

// TODO: this should be moved to imageStore
function updateImageReferences (request, post) {
  // load html in post.body into cheerio
  var html = post.body;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var images = [];
  $('img').each(function(index, element) {
    images.push(element);
  });

  // delete all image references for this post
  request.imageStore.removePostImageReferences(post.id)
  .then(function() {
    // convert each image's src to cdn version
    images.map(function(element) {
      var imgSrc = $(element).attr('src');
      request.imageStore.addPostImageReference(post.id, imgSrc);
    });
  });

  return post;
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
