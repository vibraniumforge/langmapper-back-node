const express = require("express");
const router = express.Router();
const User = require("../../../models/User.js");

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

// GET api/v1/user
// get user by id
// @access = public
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// POST api/v1/users
// post a user
// @access = public
router.post("/", (req, res) => {
  const newUser = new Language({
    name: req.body.name,
    password: req.body.password,
  });
  newUser
    .save()
    .then((user) => res.json(user))
    .catch((err) => console.log(err));
});

// DELETE api/v1/words
// delete a word
// @access = public
router.delete("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => user.remove())
    .then(() => res.json({ success: true }))
    .catch((err) => res.status(404).json({ success: false, error: err }));
});

module.exports = router;
