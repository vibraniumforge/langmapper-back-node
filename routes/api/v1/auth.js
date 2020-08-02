const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../../models/User.js");
const auth = require("../../../middleware/auth.js");

// route POST api/auth
// desc authenticate user
// access public
router.post("/", (req, res) => {
  const { name, password } = req.body.user;
  if (!name || !password) {
    res.status(400).json({ message: "Please enter all fields" });
  }
  User.findOne({ name })
    .then((user) => {
      if (!user) {
        const message = `User does NOT exist`;
        console.log(message);
        return res.status(400).json({ message: message });
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        jwt.sign(
          {
            id: user.id,
          },
          process.env.jwtSecret,
          (err, token) => {
            if (err) throw err;
            res.json({
              token: token,
              user: {
                id: user.id,
                name: user.name,
              },
              success: true,
              message: `User ${user.name} authorized.`,
            });
          }
        );
      });
    })
    .catch((err) => console.log(err));
});

// route GET by ID api/auth/user
// desc get user data
// access PRIVATE
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.json(user))
    .catch((err) => console.log(err));
});

module.exports = router;
