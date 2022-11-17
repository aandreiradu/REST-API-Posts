const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const fullToken =
    req.get("Authorization") || req.headers["Authorization"] || null;
  console.log("fullToken", fullToken);
  if (!fullToken) {
    const error = new Error("No token found in Authorization");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const token = fullToken.split(" ")[1];
    const isTokenValid = jwt.verify(token, process.env.AUTH_LOGIN_SECRET);
    console.log("isTokenValid", isTokenValid);

    if (!isTokenValid) {
      return res.status(401).json({
        message: "Invalid or expired token or the user is not authenticated",
      });
    }

    req.userId = isTokenValid.userId;
    return next();
  } catch (error) {
    if (!error.statusCode) {
      statusCode = 500;
    }

    return next(error);
  }
};

module.exports = isAuth;
