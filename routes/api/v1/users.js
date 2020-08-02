const express = require("express");
const router = express.Router();
const User = require("../../../models/User.js");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// GET api/v1/users
// get all users
// @access = public
router.get("/", (req, res) => {
  User.find()
    .sort({ date: 1 })
    .then((users) => res.json(users))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/user/parameter
// get user by parameter. name
// @access = public
router.get("/parameter", (req, res) => {
  const reqKey = Object.keys(req.body)[0];
  const reqValue = Object.values(req.body)[0];
  let query = {};
  query[reqKey] = reqValue;
  console.log(query);
  User.find(query)
    .then((user) => res.json(user))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// route GET /api/users/:id
// desc get user by id
// access public
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => console.log(err));
});

// POST api/v1/users
// register a user
// @access = public
router.post("/", (req, res) => {
  if (
    req.headers["content-type"] !== "application/json" ||
    !req.headers["content-type"]
  ) {
    console.log("!!!!Broken headers");
  }
  const { name, password } = req.body.user;
  if (!name || !password) {
    res.status(400).json({ message: "Please enter all fields" });
  }
  User.findOne({ name })
    .then((user) => {
      if (user) {
        const message = `User with name ${user.name} already exitsts.`;
        console.log(message);
        return res.status(400).json({ message: message });
      }

      const newUser = new User({
        name: name,
        password: password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
            throw err;
          }
          newUser.password = hash;
          newUser.save().then((user) => {
            jwt.sign({ id: user.id }, process.env.jwtSecret, (err, token) => {
              if (err) throw err;
              res.json({
                token: token,
                user: {
                  id: user.id,
                  name: user.name,
                },
              });
            });
          });
        });
      });
    })
    // .then(
    //   res.status(200).json({
    //     message: `User created.`,
    //     success: true,
    //   })
    // )
    .catch((err) => console.log(err));
});

//  @route PUT api/users/:id
//  @desc Update a User
//  @access PRIVATE
router.patch("/:id", (req, res) => {
  User.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.user.name,
        password: req.body.user.password,
      },
    },
    {
      new: true,
    }
  )
    .then(
      res.status(200).json({
        message: `User ${req.params.id} updated.`,
        success: true,
      })
    )
    .then(
      console.log({
        message: `User ${req.params.id} updated.`,
        success: true,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: `User ${req.params.id} NOT updated.`,
        success: false,
        error: err,
      });
    });
});

// DELETE api/v1/users
// delete a user
// @access = public
router.delete("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => user.remove())
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false });
    });
});

module.exports = router;
