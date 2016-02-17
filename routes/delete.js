var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id Delete
  * @apiName DeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to delete a post.
  *
  * @apiParam {string} id The Id of the post to delete
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 400) BadRequest Post Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
exports.delete = {
  method: 'DELETE',
  post: '/posts/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'posts.delete' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.posts.delete(server, auth, params.id)'} ],
    handler: function(request, reply) {
      var promise = request.db.posts.delete(request.params.id)
      .error(function(err) { return Boom.badRequest(err.message); });
      return reply(promise);
    }
  }
};
