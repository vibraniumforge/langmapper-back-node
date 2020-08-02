const express = require("express");
const router = express.Router();
const Translation = require("../../../models/Translation.js");

// GET api/v1/translations
// get all translations
// @access = public
router.get("/", (req, res) => {
  console.log(res, req);
  Translation.find()
    .then((translations) => res.json(translations).sort({ date: 1 }))
    .catch((err) => console.log(err));
});

// POST api/v1/translation
// post a translation
// @access = public
router.post("/", (req, res) => {
  const newTranslation = new Language({
    etymology: req.body.etymology,
    gender: req.body.gender,
    link: req.body.link,
    romanization: req.body.romanization,
    translation: req.body.translation,
  });
  newTranslation
    .save()
    .then((translation) => res.json(translation))
    .catch((err) => console.log(err));
});

// DELETE api/v1/translations
// delete a translation
// @access = public
router.delete("/:id", (req, res) => {
  Translation.findById(req.params.id)
    .then((translation) => translation.remove())
    .then(() => res.json({ success: true }))
    .catch((err) => res.status(404).json({ success: false, error: err }));
});

module.exports = router;
