const express = require("express");
const router = express.Router();
const Translation = require("../../../models/Translation.js");

// GET api/v1/translations
// get all translations
// @access = public
router.get("/", (req, res) => {
  Translation.find()
    .sort({ date: 1 })
    .then((translations) => res.json(translations))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/translation
// get translation by id
// @access = public
router.get("/:id", (req, res) => {
  Translation.findById(req.params.id)
    .then((translation) => res.json(translation))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// POST api/v1/translation
// post a translation
// @access = public
router.post("/", (req, res) => {
  const newTranslation = new Translation({
    language: req.body.translation.language,
    word_name: req.body.translation.word_name,
    etymology: req.body.translation.etymology,
    gender: req.body.translation.gender,
    link: req.body.translation.link,
    romanization: req.body.translation.romanization,
    translation: req.body.translation.translation,
  });
  newTranslation
    .save()
    .then(
      res.status(200).json({
        success: true,
        message: "Translation createed",
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

//  @route PUT api/translation/:id
//  @desc Update a Translation
//  @access public
router.patch("/:id", (req, res) => {
  Translation.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        language: req.body.translation.language,
        word_name: req.body.translation.word_name,
        etymology: req.body.translation.etymology,
        gender: req.body.translation.gender,
        link: req.body.translation.link,
        romanization: req.body.translation.romanization,
        translation: req.body.translation.translation,
      },
    },
    {
      new: true,
    }
  )
    .then(
      res.status(200).json({
        message: `Translation ${req.params.id} updated.`,
        success: true,
      })
    )
    .then(
      console.log({
        message: `Translation ${req.params.id} updated.`,
        success: true,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: `Translation ${req.params.id} NOT updated.`,
        success: false,
        error: err,
      });
    });
});

// DELETE api/v1/translations
// delete a Translation
// @access = public
router.delete("/:id", (req, res) => {
  Translation.findById(req.params.id)
    .then((translation) => translation.remove())
    .then(() =>
      res.json({
        message: `Translation ${req.params.id} deleted.`,
        success: true,
      })
    )
    .catch((err) => {
      console.log("err=", err);
      console.log("res=", res);
      res.status(404).json({ success: false, error: err });
    });
});

module.exports = router;
