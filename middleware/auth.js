require("dotenv").config();
const jwt = require("jsonwebtoken");

// get the token front the front end
// use it to authenticate the user

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  console.log(token);
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Token invalid` });
  }
}
module.exports = auth;
