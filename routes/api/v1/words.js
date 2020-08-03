const express = require("express");
const router = express.Router();
const Word = require("../../../models/Word.js");

// GET api/v1/words
// get all words
// @access = public
router.get("/", (req, res) => {
  Word.find()
    .sort({ date: 1 })
    .then((words) => res.json(words))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/words/:id
// get word by id
// @access = public
router.get("/:id([0-9a-fA-F]{24})", (req, res) => {
  Word.findById(req.params.id)
    .then((word) => res.json(word))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// POST api/v1/words
// post a word
// @access = public
router.post("/", (req, res) => {
  const newWord = new Word({
    word_name: req.body.word.word_name,
    definition: req.body.word.definition,
  });
  newWord
    .save()
    .then(
      res.status(200).json({
        success: true,
        message: `Word ${req.body.word.word_name} created.`,
        data: newWord,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

//  @route PUT api/word/:id
//  @desc Update a Word
//  @access PRIVATE
router.patch("/:id", (req, res) => {
  console.log("fires");
  Word.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        word_name: req.body.word.word_name,
        definition: req.body.word.definition,
      },
    },
    {
      new: true,
    }
  )
    .then(
      res.status(200).json({
        message: `Word ${req.params.id} updated.`,
        success: true,
        // data: newLanguage,
      })
    )
    .then(
      console.log({
        message: `Word ${req.params.id} updated.`,
        success: true,
        // data: newLanguage,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: `Word ${req.params.id} NOT updated.`,
        success: false,
        error: err,
      });
    });
});

// DELETE api/v1/words
// delete a word
// @access = public
router.delete("/:id", (req, res) => {
  Word.findById(req.params.id)
    .then((word) => word.remove())
    .then(() =>
      res.json({ message: `Language ${req.params.id} deleted.`, success: true })
    )
    .catch((err) => res.status(404).json({ success: false, error: err }));
});

// ----------------------------------------------------

// GET api/v1/words/word_names
// get all word names
// @access = public
router.get("/word_names", (req, res) => {
  console.log("word_names fires");
  Word.find()
    .sort({ word_name: 1 })
    .then((words) =>
      words.map((word) => {
        // console.log(word);
        return { id: word.word_id, name: word.word_name };
      })
    )
    .then((words) =>
      res.json({
        message: `Words found`,
        success: true,
        data: words,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/words/:id
// get all one word's definintion
// @access = public
router.get("/definition/:word", (req, res) => {
  Word.find({ word_name: req.params.word })
    .then((word) =>
      res.json({
        message: `Word definition found`,
        success: true,
        data: word[0].definition,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/words/words_count
// get count of words
// @access = public
router.get("/words_count", (req, res) => {
  Word.count()
    .then((count) =>
      res.json({
        message: `Words count found`,
        success: true,
        data: count,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

module.exports = router;
