var cheerio = require('cheerio');
var Promise = require('bluebird');

module.exports = [
  {
    name: 'common.posts.clean',
    method: clean,
    options: { callback: false }
  },
  {
    name: 'common.posts.parse',
    method: parse,
    options: { callback: false }
  },
  {
    name: 'common.images.sub',
    method: imageSub,
    options: { callback: false }
  }
];

function clean(sanitizer, payload) {
  payload.title = sanitizer.strip(payload.title);
  payload.raw_body = sanitizer.bbcode(payload.raw_body);
}

function parse(parser, payload) {
  payload.body = parser.parse(payload.raw_body);

  // check if parsing was needed
  if (payload.body === payload.raw_body) { payload.raw_body = ''; }
}

// TODO: this should be moved to imageStore
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
