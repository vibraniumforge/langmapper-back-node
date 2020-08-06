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

// ----------------------------------------------------

// find_all_translations_by_word
// GET api/v1/translations/search/word/:word
// search translations by word
// @access = public
router.get("/search/word/:word", (req, res) => {
  //   Translation.aggregate([
  //     {
  //       $lookup: {
  //         from: "words",
  //         localField: "word_name",
  //         foreignField: "word_name",
  //         as: "word_name",
  //       },
  //     },
  //     { $unwind: "$word_name" },
  //     { $match: { "language.word_name": req.params.word } },
  //     { $project: { gender: 1 } },
  //   ])
  Translation.find({ word_name: req.params.word })
    .then((words) =>
      res.json({
        message: `Translations of ${req.params.word} successfully returned.`,
        success: true,
        data: words,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// FIX ME
// find_all_translations_by_word_gender
// GET api/v1/translations/search/gender/:word
// search translations by word
// @access = public
router.get("/search/gender/:word", (req, res) => {
  Translation.aggregate([
    {
      $lookup: {
        from: "languages",
        localField: "language",
        foreignField: "name",
        as: "language",
      },
    },
    { $unwind: "$language" },
    { $match: { "translation.word_name": req.params.word } },
  ])
    //   below works, but does not give right info
    //   Translation.find({ word_name: req.params.word })
    .then((words) =>
      res.json({
        message: `Genders of ${req.params.word} successfully returned.`,
        success: true,
        data: words,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// find_etymology_containing
// / GET api/v1/languages/search/etymology/:word
// search translations by word/etymology
// @access = public
router.get("/search/etymology/:word", (req, res) => {
  //   Translation.index({ etymology: "text" });
  //   Translation.ensureIndexes({ etymology: 1 });
  Translation.find({
    $text: { $search: req.params.word, $caseSensitive: true },
  })
    .then((translations) =>
      res.json({
        message: `Etymologies containing ${req.params.word} successfully returned.`,
        success: true,
        data: translations,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// find_all_translations_by_macrofamily
// GET api/v1/translations//search/macrofamily/:macrofamily
// search translations by macrofamily
// @access = public
router.get("/search/macrofamily/:macrofamily", (req, res) => {
  Translation.aggregate([
    {
      $lookup: {
        from: "languages",
        localField: "language",
        foreignField: "name",
        as: "language",
      },
    },
    { $unwind: "$language" },
    { $match: { "language.macrofamily": req.params.macrofamily } },
  ])
    .then((languages) =>
      res.json({
        message: `All Translations by macrofamily ${req.params.macrofamily} successfully returned.`,
        success: true,
        data: languages,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// find_all_translations_by_language
// GET api/v1/translations/search/language/:language/
// search translations by language
// @access = public
router.get("/search/language/:language", (req, res) => {
  Translation.aggregate([
    {
      $lookup: {
        from: "languages",
        localField: "language",
        foreignField: "name",
        as: "language",
      },
    },
    { $unwind: "$language" },
    { $match: { "language.name": req.params.language } },
  ])
    .then((languages) =>
      res.json({
        message: `All Translations in ${req.params.language} successfully returned.`,
        success: true,
        data: languages,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// find_all_translations_by_area
// GET api/v1/translations/search/area/:area/:word
// search translation by area
// @access = public
router.get("/search/area/:area/:word", (req, res) => {
  Translation.find({
    word_name: req.params.word,
    $or: [
      { area1: req.params.area },
      { area2: req.params.area },
      { area3: req.params.area },
    ],
  })
    //   Translation.aggregate([
    //     {
    //       $lookup: {
    //         from: "languages",
    //         localField: "language",
    //         foreignField: "name",
    //         as: "language",
    //       },
    //     },
    //     { $unwind: "$language" },
    //     {
    //       $lookup: {
    //         from: "words",
    //         localField: "word_name",
    //         foreignField: "word_name",
    //         as: "word",
    //       },
    //     },
    //     { $unwind: "$word" },
    //     {
    //       $project: {
    //         _id: 1,
    //         etymology: 1,
    //         gender: 1,
    //         link: 1,
    //         romanization: 1,
    //         translation: 1,
    //         language: 1,
    //         word_name: 1,
    //         // area1: 1,
    //         // area2: 1,
    //         // area3: 1,
    //       },
    //     },
    //   ])
    .then((translations) =>
      res.json({
        message: `All Translations of ${req.params.word} in ${req.params.area} successfully returned.`,
        success: true,
        data: translations,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// translations_count
// GET api/v1/translations/get/translations_count
// get count of translations
// @access = public
router.get("/get/translations_count", (req, res) => {
  Translation.countDocuments()
    .then((count) =>
      res.json({
        message: "Translations count successfully returned.",
        success: true,
        data: count,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// seeds
// GET api/v1/translations/get/seeds
// get translation seeds
// @access = public
router.get("/get/seeds", (req, res) => {
  Translation.find()
    .limit(100)
    // .then((translations) =>
    //   translations.map((translation) => {
    //     // return { id: word._id, word_name: word.word_name };
    //   })
    // )
    .then((translations) =>
      res.json({
        message: `Translations seeds successfully returned`,
        success: true,
        data: translations,
      })
    )
    .catch((err) => {
      console.log("err=", err);
      res.status(404).json({ success: false, error: err });
    });
});

module.exports = router;

// [x]find_all_translations_by_word
// [x]find_all_translations_by_gender
// [x]find_etymology_containing
// [x]find_all_translations_by_macrofamily
// [x]find_all_translations_by_language
// [x]find_all_translations_by_area
// [x]translations_count
// [x]seeds

// # Mappers
// []find_all_translations_by_area_europe_map
// []find_all_translations_by_area_img
// []find_all_genders_by_area_img
// []find_all_etymologies_by_area_img
