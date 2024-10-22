const { Router } = require('express');
const postController = require('../controllers/postController');
const passport = require('passport');
const { isAdmin } = require('../utils/authUtils');

const postRouter = Router();

postRouter.get('/', postController.getAllPublishedPosts); // all
postRouter.post('/', passport.authenticate('jwt', { session: false }), isAdmin, postController.createPost); // admin
postRouter.get('/all', passport.authenticate('jwt', { session: false }), isAdmin, postController.getAllPosts); // admin
postRouter.get('/:id', postController.getPostById); // all (also gets all comments for this post)
postRouter.get('/:id/admin', passport.authenticate('jwt', { session: false }), isAdmin, postController.getUnpublishedPostById); // admin

postRouter.put('/:id', passport.authenticate('jwt', { session: false }), isAdmin, postController.updatePost); // admin
postRouter.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, postController.deletePost); // admin

postRouter.post('/:id/comment', passport.authenticate('jwt', { session: false }), postController.createPostComment); // user, admin
postRouter.put('/:postid/comment/:commentid', passport.authenticate('jwt', { session: false }), postController.updatePostComment); // same user, admin (auth logic in the controller middleware)
postRouter.delete('/:postid/comment/:commentid', passport.authenticate('jwt', { session: false }), postController.deletePostComment); // same user, admin (auth logic in the controller middleware)

module.exports = postRouter;