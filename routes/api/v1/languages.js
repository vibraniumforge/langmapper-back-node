const express = require("express");
const router = express.Router();
const Language = require("../../../models/Language.js");

// GET api/v1/languages
// get all languages
// @access = public
router.get("/", (req, res) => {
  Language.find()
    .sort({ date: 1 })
    .then((languages) => res.json(languages))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// GET api/v1/language
// get language by id
// @access = public
router.get("/:id", (req, res) => {
  Language.findById(req.params.id)
    .then((language) => res.json(language))
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// POST api/v1/languages
// post a language
// @access = public
router.post("/", (req, res) => {
  const newLanguage = new Language({
    name: req.body.language.name,
    abbreviation: req.body.language.abbreviation,
    alphabet: req.body.language.alphabet,
    macrofamily: req.body.language.macrofamily,
    family: req.body.language.family,
    subfamily: req.body.language.subfamily,
    area1: req.body.language.area1,
    area2: req.body.language.area2,
    area3: req.body.language.area3,
    notes: req.body.language.notes,
    alive: req.body.language.alive,
  });
  newLanguage
    .save()
    .then(
      res.status(200).json({
        success: true,
        message: "Language createed",
        data: newLanguage,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

//  @route PUT api/languages/:id
//  @desc Update a Language
//  @access PRIVATE
router.patch("/:id", (req, res) => {
  Language.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.language.name,
        abbreviation: req.body.language.abbreviation,
        alphabet: req.body.language.alphabet,
        macrofamily: req.body.language.macrofamily,
        family: req.body.language.family,
        subfamily: req.body.language.subfamily,
        area1: req.body.language.area1,
        area2: req.body.language.area2,
        area3: req.body.language.area3,
        notes: req.body.language.notes,
        alive: req.body.language.alive,
      },
    },
    {
      new: true,
    }
  )
    .then(
      res.status(200).json({
        message: `Language ${req.params.id} updated.`,
        success: true,
        // data: newLanguage,
      })
    )
    .then(
      console.log({
        message: `Language ${req.params.id} updated.`,
        success: true,
        // data: newLanguage,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: `Language ${req.params.id} NOT updated.`,
        success: false,
        error: err,
      });
    });
});

// DELETE api/v1/languages
// delete a language
// @access = public
router.delete("/:id", (req, res) => {
  Language.findById(req.params.id)
    .then((language) => language.remove())
    .then(() =>
      res.json({ message: `Language ${req.params.id} deleted.`, success: true })
    )
    .catch((err) => {
      console.log("err=", err);
      console.log("res=", res);
      res.status(404).json({ success: false, error: err });
    });
});

module.exports = router;
