const express = require("express");
const router = express.Router();
const Word = require("../../../models/Word.js");
const Mongoose = require("mongoose");
const ObjectId = Mongoose.Types.ObjectId;

// GET api/v1/words
// get all words
// @access = public
router.get("/", (req, res) => {
  Word.aggregate([
    { $sort: { _id: 1 } },
    { $project: { _id: 0, id: "$_id", word_name: 1, definition: 1 } },
  ])
    .then((words) => res.status(200).json(words))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/words/:id
// get word by id
// @access = public
router.get("/:id([0-9a-fA-F]{24})", (req, res) => {
  Word.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        word_name: 1,
        definition: 1,
      },
    },
  ])
    .then((word) => {
      const response = {
        success: true,
        message: `Word ${req.params.id} found.`,
        data: word[0],
      };
      res.status(200).json(response);
    })
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
    .then(() => {
      const response = {
        success: true,
        message: `Word ${req.body.word.word_name} created.`,
        data: newWord,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

//  @route PUT api/word/:id
//  @desc Update a Word
//  @access PRIVATE
router.patch("/:id", (req, res) => {
  Word.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        // word_name: req.body.word.word_name,
        definition: req.body.word.definition,
      },
    },
    {
      new: true,
    }
  )
    .then((word) => {
      const response = {
        message: `Word ${req.params.id} updated.`,
        success: true,
        data: word,
      };
      res.status(200).json(response);
    })
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
    .then(() => {
      const response = {
        message: `Word ${req.params.id} deleted.`,
        success: true,
      };
      res.status(200).json(response);
    })
    .catch((err) => res.status(404).json({ success: false, error: err }));
});

// ----------------------------------------------------

// GET api/v1/words/get/word_names
// get all word names
// @access = public
router.get("/get/word_names", (req, res) => {
  //   Word.find()
  //     .sort({ word_name: 1 })
  // .then((words) =>
  //   words.map((word) => {
  //     return { id: word._id, word_name: word.word_name };
  //   })
  // )
  Word.allWordNames()
    .then((words) => {
      const response = {
        message: "All Word names successfully returned.",
        success: true,
        data: words,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/words/get/words_count
// get count of words
// @access = public
router.get("/get/words_count", (req, res) => {
  //   Word.wordsCount()
  Word.countDocuments()
    .then((count) => {
      const response = {
        message: "Words count successfully returned.",
        success: true,
        data: count,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/words/search/definition/:word
// get one word's definintion
// @access = public
router.get("/search/definition/:word", (req, res) => {
  //   Word.find({ word_name: req.params.word })
  Word.findWordDefinition(req.params.word)
    .then((word) => {
      const response = {
        message: "Word definition successfully returned.",
        success: true,
        data: word.definition,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

module.exports = router;
