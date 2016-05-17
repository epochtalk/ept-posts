var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts/:id/lock Lock
  * @apiName LockPost
  * @apiPermission Admin or Mod
  * @apiDescription Used to lock a post.
  *
  * @apiParam {string} id The Id of the post to lock
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 400) BadRequest Post Not Found
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}/lock',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.posts.lock(server, auth, params.id)'} ],
    handler: function(request, reply) {
      var promise = request.db.posts.lock(request.params.id)
      .error(function(err) { return Boom.badRequest(err.message); });
      return reply(promise);
    }
  }
};
