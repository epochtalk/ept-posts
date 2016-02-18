var Joi = require('joi');
var path = require('path');
var common = require(path.normalize(__dirname + '/common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Update
  * @apiName UpdatePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to update a post.
  *
  * @apiParam {string} id The unique id of the post being updated
  * @apiUse PostObjectPayload
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'posts.update' },
    validate: {
      payload: {
        title: Joi.string().min(1).max(255).required(),
        body: Joi.string().allow(''),
        raw_body: Joi.string().required(),
        thread_id: Joi.string().required()
      },
      params: { id: Joi.string().required() }
    },
    pre: [
      { method: 'auth.posts.update(server, auth, params.id, payload.thread_id)' },
      { method: 'common.posts.clean(sanitizer, payload)' },
      { method: 'common.posts.parse(parser, payload)' },
      { method: 'common.images.sub(imageStore, payload)' }
    ],
    handler: function(request, reply) {
      var updatePost = request.payload;
      updatePost.id = request.params.id;
      var promise = request.db.posts.update(updatePost)
      // handle image references
      .then((post) => { common.updateImageReferences(request, post); });
      return reply(promise);
    }
  }
};
