var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var common = require(path.normalize(__dirname + '/../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts/:id Find
  * @apiName FindPost
  * @apiDescription Used to find a post.
  *
  * @apiParam {string} id The unique id of the post to retrieve
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the post
  */
module.exports = {
  method: 'GET',
  path: '/api/posts/{id}',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.posts.find(server, auth, params.id)', assign: 'viewDeleted' } ],
    handler: function(request, reply) {
      // retrieve post
      var userId = '';
      var authenticated = request.auth.isAuthenticated;
      if (authenticated) { userId = request.auth.credentials.id; }
      var viewDeleted = request.pre.viewDeleted;
      var id = request.params.id;
      var promise = request.db.posts.find(id)
      .then(function(post) { return common.cleanPosts(post, userId, viewDeleted); })
      .then(function(posts) { return posts[0]; })
      .error(function(err) { return Boom.badRequest(err.message); });
      return reply(promise);
    }
  }
};
