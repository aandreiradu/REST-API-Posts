require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const feedRoutes = require("./routes/feedRoutes");
const bodyParser = require("body-parser");
const connectDB = require("./config/dbConnection");
const multer = require("multer");

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

app.use(express.static(path.join(__dirname, "public"))); //make public directory accessible
app.use("/images", express.static(path.join(__dirname, "images"))); // make images directory accessible
app.use(bodyParser.urlencoded({ extended: false })); // body parser middleware
app.use(express.json()); // json parser middleware
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  console.log("a intrat pe aici");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Method", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

app.use("/feed", feedRoutes);

// custom error handler
app.use((error, req, res, next) => {
  console.log("err middleware", error);
  const message = error.message;
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message,
  });
});

mongoose.connection.once("open", () => {
  app.listen(8080, () => {
    console.log("server listening on port 8080");
  });
});
