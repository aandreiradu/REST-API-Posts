const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../utils/files/removeFile");
const Post = require("../models/Post");

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().exec();
    console.log("@@@getPosts posts result", posts);

    if (!posts) {
      return res.status(204).json({
        message: "No posts found",
      });
    }

    return res.status(200).json({
      message: "Fetched posts successfully",
      posts,
    });
  } catch (error) {
    console.log("@@@ERROR getPosts controller", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  console.log("createpost hit", req.body);
  const { title, content } = req.body;
  const errors = validationResult(req);

  console.log("errors", errors);

  if (!title || !content || !req.file) {
    const error = new Error("Invalid request params");
    error.statusCode = 422;

    return next(error);
  }

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    // throw error;
    return next(error);
  }

  try {
    const imageUrl = req.file.path;
    console.log("imageUrl is", imageUrl);
    const post = new Post({
      title,
      content,
      imageUrl: imageUrl,
      creator: {
        name: "Andrei Radu",
      },
    });

    const responseSave = await post.save();
    console.log("responseSave", responseSave);

    if (responseSave) {
      return res.status(201).json({
        message: "Post created successfully!",
        post: responseSave,
      });
    }
  } catch (error) {
    console.log("@@@ERROR createPost", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) {
    console.log("didnt received postid");
    const error = new Error("PostId params is required!");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const findPostById = await Post.findById(postId).exec();

    console.log("findPostById", findPostById);

    if (!findPostById) {
      const error = new Error(`Post not found for postId: ${postId}`);
      error.statusCode = 404;

      return next(error);
    }

    return res.status(200).json({
      message: "Post fetched",
      post: findPostById,
    });
  } catch (error) {
    console.log("@@@ERR getPostById controller", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const editPostById = async (req, res, next) => {
  // check valdations errors from the middleware start;
  const errors = validationResult(req);
  console.log("errors");

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;

    return next(error);
  }
  // check valdations errors from the middleware end;

  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!postId) {
    const error = new Error("Didnt received postId on request");
    error.statusCode = 400;
    return next(error);
  }

  if (!imageUrl) {
    const error = new Error("Didnt received imageUrl on request");
    error.statusCode = 400;
    return next(error);
  }

  // valid data here => just update in the db;
  try {
    const postById = await Post.findById(postId).exec();

    if (!postById) {
      const error = new Error(
        `No post found for the provided postId : ${postId}`
      );
      error.statusCode = 400;
      return next(error);
    }

    if (imageUrl !== postById.imageUrl) {
      // there the user uploaded a new image, so we'll delete the old one
      console.log(
        "another image uploaded, delete the old one. Path to the old one is: ",
        path.join(__dirname, "..", postById.imageUrl)
      );
      deleteFile(path.join(__dirname, "..", postById.imageUrl));
    }

    postById.title = title;
    postById.imageUrl = imageUrl;
    postById.content = content;

    console.log("updated post before saving", postById);

    const updatedPostResponse = await postById.save();

    console.log("updated post after saving", updatedPostResponse);

    if (updatedPostResponse) {
      return res.status(200).json({
        message: "Post updated successfully!",
        post: updatedPostResponse,
      });
    }
  } catch (error) {
    console.log("@@@ERROR editPostById controller", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    return next(error);
  }
};

const deletePostById = async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) {
    const error = new Error(`Invalid request. No postId provided`);
    error.statusCode = 400;
    return next(error);
  }

  try {
    // find the post in order to get the imageUrl.
    const postToBeDeleted = await Post.findById(postId).exec();

    console.log("postToBeDeleted", postToBeDeleted);

    if (!postToBeDeleted) {
      const error = new Error(
        `No product found to be deleted with postId ${postId}`
      );
      error.statusCode = 204;
      return next(error);
    }

    const imageToBeDeletedPath = postToBeDeleted.imageUrl;
    console.log("imageToBeDeletedPath", imageToBeDeletedPath);

    deleteFile(path.join(__dirname, "..", imageToBeDeletedPath));
    const deleteResponse = await Post.deleteOne({
      _id: new mongoose.Types.ObjectId(postId),
    }).exec();

    console.log("deleteResponse", deleteResponse);

    return res.status(200).json({
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.log("@@@ERROR deletePostById controller", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    return next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  editPostById,
  deletePostById,
};