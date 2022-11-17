const router = require("express").Router();
const isAuth = require("../middleware/isAuth");
const { body } = require("express-validator");
const {
  getPosts,
  createPost,
  getPostById,
  editPostById,
  deletePostById,
} = require("../controllers/feedController");

// /feed/post
router.get("/posts", isAuth, getPosts);

router.post(
  "/posts",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

// Get info about a single post
router.get("/post/:postId", isAuth, getPostById);

// Edit a single post
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  editPostById
);

// Edit post by id
router.delete("/post/:postId", isAuth, deletePostById);

module.exports = router;
