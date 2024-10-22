const { Router } = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');
const { isAdmin, isAdminOrSameUser } = require('../utils/authUtils');

const userRouter = Router();

userRouter.get('/', passport.authenticate('jwt', { session: false }), isAdmin, userController.getAllUsers); // admin
userRouter.post('/signup', userController.createUser); // all
userRouter.post('/login', userController.loginUser); // all
userRouter.get('/:id', passport.authenticate('jwt', { session: false }), isAdminOrSameUser, userController.getUserById); // admin, same user
userRouter.delete('/:id', passport.authenticate('jwt', { session: false }), isAdminOrSameUser, userController.deleteUser); // admin, same user
userRouter.patch('/:id', passport.authenticate('jwt', { session: false }), isAdminOrSameUser, userController.updateUser); // admin, same user
userRouter.patch('/:id/admin', passport.authenticate('jwt', { session: false }), isAdmin, userController.updateUserAdmin); // admin

// with the local strategy, the passport.authenticate method was called just one time in the login post route 
// and after that req.session.passport.user or req.isAuthenticated() was used to validate whether a user is logged in  

// with JWT every protected route must have this syntax: passport.authenticate('jwt', { session: false })
// JWT is by default stateless, so sessions are not being used, hence this authenticate function must be called every time, 
// so the passport middleware can grab the JWT included in the request and verify it

module.exports = userRouter;