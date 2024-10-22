const jwt = require('jsonwebtoken');
const { CustomAuthError } = require('./CustomErrors');
require('dotenv').config();

const issueJWT = (user) => {
  const expiresIn = '1d';

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn,
  });

  return {
    // front-end will have to store it (for example in local storage) and attach it to every single request
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new CustomAuthError(`User is not authorized to make this request.`);
  }
  next();
};

const isAdminOrSameUser = (req, res, next) => {
  const userId = parseInt(req.params.id, 10); // works as long as params in routes is :id and not something like :authorid
  if (!req.user.isAdmin && req.user.id !== userId) {
    throw new CustomAuthError(`User is not authorized to make this request.`);
  }
  next();
};

module.exports = {
  issueJWT,
  isAdmin,
  isAdminOrSameUser,
};
