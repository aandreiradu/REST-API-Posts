const router = require("express").Router();
const { body } = require("express-validator");
const {
  getPosts,
  createPost,
  getPostById,
  editPostById,
  deletePostById,
} = require("../controllers/feedController");

// /feed/post
router.get("/posts", getPosts);

router.post(
  "/posts",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

// Get info about a single post
router.get("/post/:postId", getPostById);

// Edit a single post
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  editPostById
);

// Edit post by id
router.delete("/post/:postId", deletePostById);

module.exports = router;
