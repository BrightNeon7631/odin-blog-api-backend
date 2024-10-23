const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// USERS
// Get All Users
const queryGetAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    },
    orderBy: {
      id: 'desc',
    },
  });
};

// Get User
const queryGetUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
};

// Get User by Email
const queryGetUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

// Create User
const queryCreateUser = async (name, email, password, isAdmin = false) => {
  return await prisma.user.create({
    // returns the user and these propertries
    data: {
      name: name,
      email: email,
      password: password,
      isAdmin: isAdmin,
    },
  });
};

// Update User
const queryUpdateUser = async (
  userId,
  newName,
  newEmail,
  newPassword,
  newIsAdmin
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    // support for patch
    data: {
      ...((newName !== undefined || newName !== '') && { name: newName }),
      ...((newEmail !== undefined || newEmail !== '') && { email: newEmail }),
      ...((newPassword !== undefined || newPassword !== '') && { password: newPassword }),
      ...(newIsAdmin !== undefined && { isAdmin: newIsAdmin }),
    },
  });
};

// Delete user
const queryDeleteUser = async (userId) => {
  return await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

// POSTS
// Create Post
const queryCreatePost = async (
  title,
  text,
  isPublished,
  imageUrl,
  authorId
) => {
  return await prisma.post.create({
    data: {
      title: title,
      text: text,
      isPublished: isPublished,
      imageUrl: imageUrl,
      authorId: authorId,
    },
  });
};

// Get All Published Posts
const queryGetAllPublishedPosts = async () => {
  return await prisma.post.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
};

// Get All Posts
const queryGetAllPosts = async () => {
  return await prisma.post.findMany({
    orderBy: {
      id: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
};

// Get Post
const queryGetPostById = async (id) => {
  return await prisma.post.findUnique({
    where: {
      id: id,
    },
    // The following queries use select within an include
    // https://www.prisma.io/docs/orm/prisma-client/queries/select-fields
    include: {
      comments: {
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          text: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });
};

// Update Post
const queryUpdatePost = async (
  postId,
  newTitle,
  newText,
  newIsPublished,
  newImageUrl
) => {
  return await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      title: newTitle,
      text: newText,
      isPublished: newIsPublished,
      imageUrl: newImageUrl,
    },
  });
};

// Delete Post
const queryDeletePost = async (postId) => {
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

// COMMENTS
// Create Comment
const queryCreateComment = async (text, postId, authorId) => {
  return await prisma.comment.create({
    data: {
      text: text,
      postId: postId,
      authorId: authorId,
    },
  });
};

// Get All Comments
const queryGetAllComments = async () => {
  return await prisma.comment.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      post: {
        select: {
          title: true,
          id: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });
};

// Get Comment
const queryGetCommentById = async (id) => {
  return await prisma.comment.findUnique({
    where: {
      id: id,
    },
  });
};

// Update comment
const queryUpdateComment = async (commentId, newText) => {
  return await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      text: newText,
    },
  });
};

// Delete comment
const queryDeleteComment = async (commentId) => {
  return await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};

const queryGetCommentsByAuthorId = async (authorId) => {
  return await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      post: {
        select: {
          title: true,
          id: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });
};

module.exports = {
  queryCreateUser,
  queryGetAllUsers,
  queryGetUserById,
  queryGetUserByEmail,
  queryUpdateUser,
  queryDeleteUser,

  queryCreatePost,
  queryGetAllPublishedPosts,
  queryGetAllPosts,
  queryGetPostById,
  queryUpdatePost,
  queryDeletePost,

  queryCreateComment,
  queryGetAllComments,
  queryGetCommentById,
  queryUpdateComment,
  queryDeleteComment,
  queryGetCommentsByAuthorId,
};
