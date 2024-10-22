const db = require('../db/queries');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const {
  CustomNotFoundError,
  CustomAuthError,
} = require('../utils/CustomErrors');

const validateComment = [
  body('text')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment text must be between 1 and 1000 characters.'),
];

const getAllComments = asyncHandler(async (req, res) => {
  const comments = await db.queryGetAllComments();
  res.send(comments);
});

const getCommentById = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const comment = await db.queryGetCommentById(commentId);
  if (!comment) {
    throw new CustomNotFoundError(
      `404 - Comment with id: ${commentId} wasn't found`
    );
  }
  res.send(comment);
});

const getCommentsByAuthorId = asyncHandler(async (req, res) => {
  const authorId = parseInt(req.params.authorid, 10);
  const comments = await db.queryGetCommentsByAuthorId(authorId);
  res.send(comments);
});

const updateComment = [
  validateComment,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const commentId = parseInt(req.params.id, 10);
    const text = req.body.text;
    const comment = await db.queryGetCommentById(commentId);
    if (!comment) {
      throw new CustomNotFoundError(
        `404 - Comment with id: ${commentId} wasn't found`
      );
    }

    const commentAuthorId = comment.authorId;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (commentAuthorId !== userId && !isAdmin) {
      throw new CustomAuthError(
        `User is not authorized to make this requst`
      );
    } else {
      const updatedPostComment = await db.queryUpdateComment(commentId, text);
      res.send(updatedPostComment);
    }
  }),
];

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const comment = await db.queryGetCommentById(commentId);
  if (!comment) {
    throw new CustomNotFoundError(
      `404 - Comment with id: ${commentId} wasn't found`
    );
  }

  const commentAuthorId = comment.authorId;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;

  if (commentAuthorId !== userId && !isAdmin) {
    throw new CustomAuthError(
      `User is not authorized to make this requst`
    );
  } else {
    await db.queryDeleteComment(commentId);
    res.send({ message: `Comment with id: ${commentId} was deleted.` });
  }
});

module.exports = {
  getAllComments,
  getCommentById,
  getCommentsByAuthorId,
  updateComment,
  deleteComment,
};
