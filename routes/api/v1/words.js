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
router.get("/:id", (req, res) => {
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

module.exports = router;
