var Joi = require('joi');
var Promise = require('bluebird');
var cheerio = require('cheerio');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts Page By Thread
  * @apiName PagePostsByThread
  * @apiDescription Used to page through posts by thread.
  *
  * @apiParam (Query) {string} thread_id Id of the thread to retrieve posts from
  * @apiParam (Query) {number} page Specific page of posts to retrieve. Do not use with start.
  * @apiParam (Query) {mixed} limit Number of posts to retrieve per page.
  * @apiParam (Query) {number} start Specific post within the thread. Do not use with page.
  *
  * @apiSuccess {array} posts Object containing posts for particular page, the thread these Posts
  * belong to, and the calculated page and limit constraints.
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the posts for thread
  */
module.exports = {
  method: 'GET',
  path: '/threads/{thread_id}/posts',
  config: {
    app: { hook: 'posts.byThread' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { thread_id: Joi.string().required() } },
    pre: [
      { method: 'auth.posts.metaByThread(server, auth, params.thread_id)', assign: 'viewable' },
    ]
  },
  handler: function(request, reply) {
    var threadId = request.params.thread_id;
    var viewable = request.pre.viewable;
    var config = request.server.app.config;
    var data = {
      title: config.website.title,
      description: config.website.description,
      keywords: config.website.keywords,
      logo: config.website.logo,
      favicon: config.website.favicon,
      websocket_host: config.websocket_client_host,
      websocket_port: config.websocket_port
    };

    // retrieve posts for this thread
    var getFirstPost = request.db.posts.byThread(threadId, { start: 0, limit: 1 });
    var getThread = request.db.threads.find(threadId);

    return Promise.join(getThread, getFirstPost, function(thread, post) {
      var $ = cheerio.load('<div>' + post[0].body + '</div>');
      var postBody = $('div').text();

      if (thread.title && viewable) {
        data.ogTitle = data.twTitle = config.website.title + ': ' + thread.title;
      }

      if (postBody && viewable) {
        data.ogDescription = data.twDescription = postBody;
      }

      if (viewable) {
        data.twLabel1 = 'Post Count:';
        data.twData1 = thread.post_count + ' Post(s)';

        data.twLabel2 = 'Created By:';
        data.twData2 = post[0].user.username;
      }

      return data;
    })
    .then(function(data) {
      return reply.view('index', data);
    });
  }
};