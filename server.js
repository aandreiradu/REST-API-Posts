require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const connectDB = require("./config/dbConnection");
const multer = require("multer");

const feedRoutes = require("./routes/feedRoutes");
const authRoutes = require("./routes/authRoutes");

// Server
const app = express();

// Connect to DB
connectDB();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); // body parser middleware
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images"))); // make images directory accessible
app.use(express.static(path.join(__dirname, "public"))); //make public directory accessible
app.use(express.json()); // json parser middleware

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// custom error handler
app.use((error, req, res, next) => {
  console.log("err middleware", error);
  const message = error.message;
  const statusCode = error.statusCode || 500;
  const data = error.data || [];

  return res.status(statusCode).json({
    message,
    data,
  });
});

mongoose.connection.once("open", () => {
  app.listen(8080, () => {
    console.log("server listening on port 8080");
  });
});
