const db = require('../db/queries');
const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const {
  CustomNotFoundError,
  CustomAuthError,
} = require('../utils/CustomErrors');
const { issueJWT } = require('../utils/authUtils');

const validateUser = [
  body('name')
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters.'),
  body('email')
    .trim()
    .isEmail()
    .isLength({ min: 1, max: 100 })
    .withMessage('Email cannot exceed 100 characters.'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters.'),
];

const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .isLength({ min: 1, max: 100 })
    .withMessage('Email cannot exceed 100 characters.'),
  body('password')
    .optional()
    .trim()
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters.'),
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .isLength({ min: 1, max: 100 })
    .withMessage('Email cannot exceed 100 characters.'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters.'),
];

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await db.queryGetAllUsers();
  res.send(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await db.queryGetUserById(userId);

  if (!user) {
    throw new CustomNotFoundError(
      `404 - User with id: ${userId} wasn't found.`
    );
  }

  res.send(user);
});

const createUser = [
  validateUser,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        try {
          // didn't check if user with unique constraints (name and email) already exist because they're marked as unique in the db and there'll be a prisma error anyway
          const newUser = await db.queryCreateUser(name, email, hashedPassword);
          // creates the jwt using the custom function
          const jwt = issueJWT(newUser);
          res.send({ user: newUser, token: jwt.token, expiresIn: jwt.expires });
        } catch (err) {
          // https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
              next(new Error('User with this name or email already exists'));
            } else {
              next(err);
            }
          }
        }
      }
    });
  }),
];

const loginUser = [
  validateLogin,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const { email, password } = req.body;
    const user = await db.queryGetUserByEmail(email);
    if (!user) {
      throw new CustomAuthError(`User with email: ${email} wasn't found`);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new CustomAuthError(`Wrong password`);
    }

    // if the password is valid a jwt can be issued to this user
    const jwt = issueJWT(user);
    res.send({ user: user, token: jwt.token, expiresIn: jwt.expires });
  }),
];

const updateUser = [
  validateUserUpdate,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const userId = parseInt(req.params.id, 10);
    const { name, email, password } = req.body;
    if (password) {
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
          next(err);
        } else {
          try {
            const updatedUser = await db.queryUpdateUser(
              userId,
              name,
              email,
              hashedPassword
            );
            res.send(updatedUser);
          } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
              if (err.code === 'P2002') {
                next(new Error('User with this name or email already exists'));
              } else {
                next(err);
              }
            }
          }
        }
      });
    } else {
      try {
        const updatedUser = await db.queryUpdateUser(userId, name, email);
        res.send(updatedUser);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            next(new Error('User with this name or email already exists'));
          } else {
            next(err);
          }
        }
      }
    }
  }),
];

// can update isAdmin property but not password
const updateUserAdmin = [
  validateUserUpdate,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const userId = parseInt(req.params.id, 10);
    const { name, email, isAdmin } = req.body;
    try {
      const updatedUser = await db.queryUpdateUser(
        userId,
        name,
        email,
        undefined,
        isAdmin
      );
      res.send(updatedUser);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          next(new Error('User with this name or email already exists'));
        } else {
          next(err);
        }
      }
    }
  }),
];

const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  // async handler will throw an error if user with this id doesn't exist etc.
  await db.queryDeleteUser(userId);
  res.send({ message: `User with id: ${userId} was deleted` });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  updateUserAdmin,
  deleteUser,
};
