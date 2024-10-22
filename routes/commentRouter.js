const { Router } = require('express');
const commentController = require('../controllers/commentController');
const passport = require('passport');

const commentRouter = Router();

commentRouter.get('/', commentController.getAllComments); // all
commentRouter.get('/:id', commentController.getCommentById); // all
commentRouter.put('/:id', passport.authenticate('jwt', { session: false }), commentController.updateComment); // same user, admin
commentRouter.delete('/:id', passport.authenticate('jwt', { session: false }), commentController.deleteComment); // same user, admin
commentRouter.get('/author/:authorid', commentController.getCommentsByAuthorId); // all

module.exports = commentRouter;