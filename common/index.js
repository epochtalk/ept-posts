var _ = require('lodash');
var cheerio = require('cheerio');
var bbcodeParser = require('epochtalk-bbcode-parser');

module.exports = {
  clean: clean,
  parse: parse,
  sub: imageSub,
  createImageReferences: createImageReferences,
  updateImageReferences: updateImageReferences,
  cleanPosts: cleanPosts
};

function clean(sanitizer, payload) {
  payload.title = sanitizer.strip(payload.title);
  payload.raw_body = sanitizer.bbcode(payload.raw_body);
}

// TODO: move parsing function out into hapi core
function parse(payload) {
  var raw_body = payload.raw_body;
  // check if raw_body has any bbcode
  if (raw_body.indexOf('[') >= 0) {
    // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
    // in the bbcode parser that'll unescape those chars
    raw_body = raw_body.replace(/(?:<|&lt;)/g, '&#60;');
    raw_body = raw_body.replace(/(?:>|&gt;)/g, '&#62;');

    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    raw_body = textToEntities(raw_body);

    // parse raw_body to generate body
    var parsedBody = bbcodeParser.process({text: raw_body}).html;
    payload.body = parsedBody;

    // check if parsing was needed
    // it wasn't need so remove raw_body
    if (parsedBody === raw_body) { payload.raw_body = ''; }
  }
  else {
    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    raw_body = textToEntities(raw_body);

    // nothing to parse, just move raw_body to body
    payload.body = raw_body;
    payload.raw_body = '';
  }
}

function imageSub(imageStore, payload) {
  var html = payload.body;
  // load html in post.body into cheerio
  var $ = cheerio.load(html);

  // collect all the images in the body
  var images = [];
  $('img').each(function(index, element) {
    images.push(element);
  });

  // convert each image's src to cdn version
  return Promise.map(images, function(element) {
    var imgSrc = $(element).attr('src');
    var savedUrl = imageStore.saveImage(imgSrc);

    if (savedUrl) {
      // move original src to data-canonical-src
      $(element).attr('data-canonical-src', imgSrc);
      // update src with new url
      $(element).attr('src', savedUrl);
    }
  })
  .then(function() { payload.body = $.html(); });
}

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




function textToEntities(text) {
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += '&#' + text.charCodeAt(i) + ';';
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}
