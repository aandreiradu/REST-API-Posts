const router = require("express").Router();
const { body } = require("express-validator");
const User = require("../models/User");
const {
  signUpUser,
  loginUser,
  getUserStatus,
  updateUserStatus,
} = require("../controllers/authController");
const isAuth = require("../middleware/isAuth");

// Signup
router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom(async (value, { req }) => {
        const existingEmail = await User.find({ email: value }).exec();
        console.log("existingEmail", existingEmail);
        if (existingEmail.length > 0) {
          return Promise.reject("Email adress already in use!");
        }
      })
      .normalizeEmail(),
    body("name").trim().notEmpty(),
    body("password").trim().isLength({ min: 5 }),
  ],
  signUpUser
);

// LoginUser
router.post("/login", loginUser);

// GetStatus
router.get("/status", isAuth, getUserStatus);

// UpdateStatus
router.patch(
  "/status",
  [body("status").trim().not().isEmpty()],
  isAuth,
  updateUserStatus
);

module.exports = router;
