const db = require('../db/queries');
const asyncHandler = require('express-async-handler');
const { Prisma } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const {
  CustomNotFoundError,
  CustomAuthError,
} = require('../utils/CustomErrors');

const validatePost = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters.'),
  body('text')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10 000 characters.'),
  body('imageUrl')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image URL must be between 1 and 200 characters.'),
];

const validateComment = [
  body('text')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters.'),
];

const getAllPublishedPosts = asyncHandler(async (req, res) => {
  const posts = await db.queryGetAllPublishedPosts();
  res.send(posts);
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await db.queryGetAllPosts();
  res.send(posts);
});

// gets only published posts and their comments
const getPostById = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const post = await db.queryGetPostById(postId);
  if (!post) {
    throw new CustomNotFoundError(`404 - Post with id: ${postId} wasn't found`);
  }

  if (!post.isPublished) {
    throw new CustomAuthError(`User is not authorized to make this request`);
  }

  res.send(post);
});

// can actually get all posts by id
const getUnpublishedPostById = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const post = await db.queryGetPostById(postId);
  if (!post) {
    throw new CustomNotFoundError(`404 - Post with id: ${postId} wasn't found`);
  }
  res.send(post);
});

const createPost = [
  validatePost,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const { title, text, isPublished, imageUrl } = req.body;
    const authorId = req.user.id;

    try {
      const newPost = await db.queryCreatePost(
        title,
        text,
        isPublished,
        imageUrl,
        authorId
      );
      res.send(newPost);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          next(new Error('Post with this title already exists'));
        } else {
          next(err);
        }
      }
    }
  }),
];

const updatePost = [
  validatePost,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    
    const postId = parseInt(req.params.id, 10);
    const { title, text, isPublished, imageUrl } = req.body;

    try {
      const updatedPost = await db.queryUpdatePost(
        postId,
        title,
        text,
        isPublished,
        imageUrl
      );
      res.send(updatedPost);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          next(new Error('Post with this title already exists'));
        } else {
          next(err);
        }
      }
    }
  }),
];

const deletePost = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  await db.queryDeletePost(postId);
  res.send({ message: `Post with id: ${postId} was deleted.` });
});

// COMMENTS
const createPostComment = [
  validateComment,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const postId = parseInt(req.params.id, 10);
    const text = req.body.text;
    const authorId = req.user.id;

    const post = await db.queryGetPostById(postId);
    if (!post) {
      throw new CustomNotFoundError(
        `404 - Post with id: ${postId} wasn't found`
      );
    }

    const newPostComment = await db.queryCreateComment(text, postId, authorId);
    res.send(newPostComment);
  }),
];

const updatePostComment = [
  validateComment,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const postId = parseInt(req.params.postid, 10);
    const commentId = parseInt(req.params.commentid, 10);
    const text = req.body.text;

    // check if the post exists
    const post = await db.queryGetPostById(postId);
    if (!post) {
      throw new CustomNotFoundError(
        `404 - Post with id: ${postId} wasn't found`
      );
    }

    // check if the comment exists (post includes comments, so there's no need for another db query)
    const comment = post.comments.find((element) => element.id === commentId);
    if (!comment) {
      throw new CustomNotFoundError(
        `404 - Comment with id: ${commentId} wasn't found`
      );
    }

    // user can update only their own comments and admin can update every comment
    const commentAuthorId = comment.author.id;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (commentAuthorId !== userId && !isAdmin) {
      throw new CustomAuthError(`User is not authorized to make this requst`);
    } else {
      const updatedPostComment = await db.queryUpdateComment(commentId, text);
      res.send(updatedPostComment);
    }
  }),
];

const deletePostComment = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.postid, 10);
  const commentId = parseInt(req.params.commentid, 10);

  const post = await db.queryGetPostById(postId);
  if (!post) {
    throw new CustomNotFoundError(`404 - Post with id: ${postId} wasn't found`);
  }

  const comment = post.comments.find((element) => element.id === commentId);
  if (!comment) {
    throw new CustomNotFoundError(
      `404 - Comment with id: ${commentId} wasn't found`
    );
  }

  const commentAuthorId = comment.author.id;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;

  if (commentAuthorId !== userId && !isAdmin) {
    throw new CustomAuthError(`User is not authorized to make this requst`);
  } else {
    await db.queryDeleteComment(commentId);
    res.send({ message: `Comment with id: ${commentId} was deleted.` });
  }
});

module.exports = {
  getAllPublishedPosts,
  getAllPosts,
  getPostById,
  getUnpublishedPostById,
  createPost,
  updatePost,
  deletePost,
  createPostComment,
  updatePostComment,
  deletePostComment,
};
