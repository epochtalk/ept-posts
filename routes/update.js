var Joi = require('joi');

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
    validate: {
      payload: {
        title: Joi.string().min(1).max(255).required(),
        raw_body: Joi.string().min(1).max(5000).required(),
        thread_id: Joi.string().required()
      },
      params: { id: Joi.string().required() }
    },
    pre: [
      { method: 'auth.posts.update(server, auth, params.id, payload.thread_id)' },
      { method: 'common.posts.clean(sanitizer, payload)' },
      { method: 'common.posts.parse(parser, payload)' },
      { method: 'common.images.sub(payload)' }
    ],
    handler: function(request, reply) {
      var updatePost = request.payload;
      updatePost.id = request.params.id;
      var promise = request.db.posts.update(updatePost)
      // handle image references
      .then((post) => { return request.imageStore.updateImageReferences(post); });
      return reply(promise);
    }
  }
};
