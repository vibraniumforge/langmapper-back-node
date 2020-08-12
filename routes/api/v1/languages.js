const express = require("express");
const router = express.Router();
const Language = require("../../../models/Language.js");

// GET api/v1/languages
// get all languages
// @access = public
router.get("/", (req, res) => {
  const languageProject = {
    _id: 0,
    id: "$_id",
    name: 1,
    abbreviation: 1,
    alphabet: 1,
    macrofamily: 1,
    family: 1,
    subfamily: 1,
    area1: 1,
    area2: 1,
    area3: 1,
    notes: 1,
    alive: 1,
  };
  Language.find({}, languageProject)
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

// ----------------------------------------------------

// DONE
// GET api/v1/languages/get/macrofamily_names
// get all macrofamily names
// @access = public
router.get("/get/macrofamily_names", (req, res) => {
  Language.distinct("macrofamily")
    // .sort({ word_name: 1 })
    .then((macrofamiles) =>
      res.json({
        message: "All Macrofamily names successfully returned.",
        success: true,
        count: macrofamiles.length,
        data: macrofamiles,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/languages/get/alphabet_names
// get all alphabet names
// @access = public
router.get("/get/alphabet_names", (req, res) => {
  //   Language.aggregate([
  //     { $group: { _id: "$alphabet" } },
  //     { $sort: { alphabet: 1 } },
  //   ])
  Language.distinct("alphabet")
    // .sort({ alphabet: 1 })
    .then((alphabetNames) =>
      res.json({
        message: "All Alphabet names successfully returned.",
        success: true,
        count: alphabetNames.length,
        data: alphabetNames,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/languages/get/area_names
// get all language area names
// @access = public
router.get("/get/area_names", (req, res) => {
  // SQL AREL equivalent
  //   Language.select(:area1, :area2, :area3).distinct.pluck(:area1, :area2, :area3).flatten.uniq.reject{|x|x.blank?}.sort

  //   This works, but returns wrong format
  //   Language.aggregate([
  //     {
  //       $project: {
  //         _id: 0,
  //         area1: {
  //           $cond: {
  //             if: { $eq: ["", "$area1"] },
  //             then: "$REMOVE",
  //             else: "$area1",
  //           },
  //         },
  //         area2: {
  //           $cond: {
  //             if: { $eq: ["", "$area2"] },
  //             then: "$REMOVE",
  //             else: "$area2",
  //           },
  //         },
  //         area3: {
  //           $cond: {
  //             if: { $eq: ["", "$area3"] },
  //             then: "$REMOVE",
  //             else: "$area3",
  //           },
  //         },
  //       },
  //     },
  //   ])

  let allAreas = [];
  Language.distinct("area1").then((areas) =>
    areas.forEach((area) => {
      if (area && !allAreas.includes(area)) {
        allAreas.push(area);
      }
    })
  );
  Language.distinct("area2").then((areas) =>
    areas.forEach((area) => {
      if (area && !allAreas.includes(area)) {
        allAreas.push(area);
      }
    })
  );
  Language.distinct("area3")
    .then((areas) =>
      areas.forEach((area) => {
        if (area && !allAreas.includes(area)) {
          allAreas.push(area);
        }
      })
    )
    .then(() => {
      res.json({
        message: "All Language area names successfully returned.",
        success: true,
        count: allAreas.length,
        data: allAreas.sort(),
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/languages/search/area/:area
// search languages by area
// @access = public
router.get("/search/area/:area", (req, res) => {
  Language.findLanguagesByArea(req.params.area)
    //   Language.aggregate([
    //     {
    //       $match: {
    //         $or: [
    //           { area1: req.params.area },
    //           { area2: req.params.area },
    //           { area3: req.params.area },
    //         ],
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 0,
    //         id: "$_id",
    //         name: 1,
    //         abbreviation: 1,
    //         alphabet: 1,
    //         macrofamily: 1,
    //         family: 1,
    //         subfamily: 1,
    //         area1: 1,
    //         area2: 1,
    //         area3: 1,
    //         notes: 1,
    //         alive: 1,
    //       },
    //     },
    //   ])
    .then((languages) =>
      res.json({
        message: `All Languages in ${req.params.area} successfully returned.`,
        success: true,
        count: languages.length,
        data: languages,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// GET api/v1/languages/get/languages_count
// get count of languages
// @access = public
router.get("/get/languages_count", (req, res) => {
  Language.countDocuments()
    .then((count) =>
      res.json({
        message: "Languages count successfully returned.",
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
