var Joi = require('joi');
var path = require('path');
var common = require(path.normalize(__dirname + '/common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts Create
  * @apiName CreatePost
  * @apiPermission User
  * @apiDescription Used to create a new post.
  *
  * @apiUse PostObjectPayload
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the post
*/
module.exports = {
  method: 'POST',
  path: '/api/posts',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'posts.create' },
    validate: {
      payload: Joi.object().keys({
        title: Joi.string().min(1).max(255).required(),
        body: Joi.string().allow(''),
        raw_body: Joi.string().required(),
        thread_id: Joi.string().required()
      })
    },
    pre: [
      { method: 'auth.posts.create(server, auth, payload.thread_id)' },
      { method: 'common.posts.clean(sanitizer, payload)' },
      { method: 'common.posts.parse(parser, payload)' },
      { method: 'common.images.sub(imageStore, payload)' }
    ],
    handler: function(request, reply) {
      // build the post object from payload and params
      var newPost = request.payload;
      newPost.user_id = request.auth.credentials.id;

      // create the post in db
      var promise = request.db.posts.create(newPost)
      // handle any image references
      .then((post) => { common.createImageReferences(request, post); });
      return reply(promise);
    }
  }
};
