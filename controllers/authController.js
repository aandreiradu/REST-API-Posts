const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUpUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    const error = new Error("Invalid request params");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const hasedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email,
      password: hasedPassword,
      name,
    });

    const saveUser = await newUser.save();
    if (saveUser) {
      console.log("user created here");
      return res.status(201).json({
        message: "Account created successfully!",
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();
    console.log("existing user", user);
    if (!user) {
      const error = new Error("Account not found for provided credentials");
      error.statusCode = 401;
      return next(error);
    }

    const samePassword = await bcrypt.compare(password, user.password);
    if (!samePassword) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      return next(error);
    }

    // generate JWT
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.AUTH_LOGIN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    return next(error);
  }
};

const getUserStatus = async (req, res, next) => {
  const userId = req.userId || null;
  if (!userId) {
    const error = new Error("Couldnt get the userId from request");
    error.statusCode = 401;

    return next(error);
  }

  try {
    const userData = await User.findById(userId).exec();

    if (!userData) {
      const error = new Error(
        `Couldnt identify the user based on provided userId : ${userId}`
      );
      error.statusCode = 401;
      return next(error);
    }

    return res.status(200).json({
      status: userData.status,
      userId: userData._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      return next(error);
    }
  }
};

const updateUserStatus = async (req, res, next) => {
  console.log("req.body", req.body);
  const userId = req.userId || null;
  if (!userId) {
    const error = new Error("Couldnt get the userId from request");
    error.statusCode = 401;

    return next(error);
  }

  const { status } = req.body;
  if (!status) {
    const error = new Error("Invalid request params");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const userData = await User.findById(userId).exec();

    userData.status = status;
    const responseSave = await userData.save();

    if (responseSave) {
      return res.status(200).json({
        message: "Status updated successfully",
        status: status,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      return next(error);
    }
  }
};

module.exports = {
  signUpUser,
  loginUser,
  getUserStatus,
  updateUserStatus,
};
