const express = require("express");
const router = express.Router();
const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    { $match: { word_name: req.params.word } },
    { $sort: { "language.name": 1 } },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        id: "$_id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
      },
    },
  ])
    //   Translation.find({ word_name: req.params.word })
    .then((words) =>
      res.json({
        message: `Translations of ${req.params.word} successfully returned.`,
        success: true,
        count: words.length,
        data: words,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            "language.macrofamily": { $in: ["Indo-European", "Afro-Asiatic"] },
          },
        ],
      },
    },
    { $sort: { "language.family": 1 } },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        id: "$_id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
      },
    },
  ])
    .then((words) =>
      res.json({
        message: `Genders of ${req.params.word} successfully returned.`,
        success: true,
        count: words.length,
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
// GET api/v1/languages/search/etymology/:word
// search translations by word containing an etymology
// @access = public
router.get("/search/etymology/:word", (req, res) => {
  // mogoose below
  //   Translation.index({ etymology: "text" });
  // native mongo below
  //   Translation.createIndex({ etymology: 1 });
  //   Translation.find({
  //     $text: {
  //       $search: req.params.word,
  //       $caseSensitive: true,
  //       $diacriticSensitive: false,
  //     },
  //   })
  Translation.aggregate([
    {
      $match: {
        $text: {
          $search: req.params.word,
        },
      },
    },
    {
      $lookup: {
        from: "languages",
        localField: "language",
        foreignField: "name",
        as: "language",
      },
    },
    { $unwind: "$language" },
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $project: {
        _id: 0,
        id: "$_id",
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
      },
    },
  ])
    .then((translations) =>
      res.json({
        message: `Etymologies containing ${req.params.word} successfully returned.`,
        success: true,
        count: translations.length,
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
// GET api/v1/translations/search/macrofamily/:macrofamily
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    { $match: { "language.macrofamily": req.params.macrofamily } },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        id: "$_id",
        name: "$language.name",
        family: "$language.family",
      },
    },
  ])
    .then((languages) =>
      res.json({
        message: `All Translations by macrofamily ${req.params.macrofamily} successfully returned.`,
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    { $match: { "language.name": req.params.language } },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        id: "$_id",
        // name: "$language.name",
        // family: "$language.family",
      },
    },
  ])
    .then((languages) =>
      res.json({
        message: `All Translations in ${req.params.language} successfully returned.`,
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

// DONE
// find_all_translations_by_area
// GET api/v1/translations/search/area/:area/:word
// search translation by area
// @access = public
router.get("/search/area/:area/:word", (req, res) => {
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            $or: [
              { "language.area1": req.params.area },
              { "language.area2": req.params.area },
              { "language.area3": req.params.area },
            ],
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        id: "$_id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
        subfamily: "$language.subfamily",
      },
    },
  ])
    .then((translations) =>
      res.json({
        message: `All Translations of ${req.params.word} in ${req.params.area} successfully returned.`,
        success: true,
        count: translations.length,
        data: translations,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// DONE
// find_all_translations_by_area_europe_map
// GET api/v1/translations/search/area_europe_map/:area/:word
// search translation by area FROM THE EUROPE MAP ONLY
// @access = public
router.get("/search/area_europe_map/:area/:word", (req, res) => {
  //prettier-ignore
  const myEuropeSvg = ["ab", "ar", "az", "be", "bg", "br", "ca", "co", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fi", "fo", "fr", "fy", "ga", "gag", "gd", "gl", "hu", "hy", "is", "it", "ka", "kk", "krl", "lb", "lij", "lt", "lv", "mk", "mt", "nap", "nl", "no", "oc", "os", "pl", "pms", "pt", "rm", "ro", "ru", "sc", "scn", "sco", "se", "sh", "sk", "sl", "sq", "sv", "tk", "tt", "uk", "vnc", "xal"];
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            $or: [
              { "language.area1": req.params.area },
              { "language.area2": req.params.area },
              { "language.area3": req.params.area },
            ],
          },
        ],
      },
    },
    {
      $sort: {
        "language.macrofamily": 1,
        "language.family": 1,
        "language.subfamily": 1,
      },
    },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        id: "$_id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
        subfamily: "$language.subfamily",
      },
    },
  ])
    .then((translations) =>
      res.json({
        message: `All Translations of ${req.params.word} in ${req.params.area} successfully returned.`,
        success: true,
        count: translations.length,
        data: translations,
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(404).json({ success: false, error: err });
    });
});

// MAPPERS

// DONE
// find_all_translations_by_area_img
// GET api/v1/translations/search/all_translations_by_area_img/:area/:word
// search translation by area and from the europe map by TRANSLATION
// @access = public
router.get("/search/all_translations_by_area_img/:area/:word", (req, res) => {
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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            $or: [
              { "language.area1": req.params.area },
              { "language.area2": req.params.area },
              { "language.area3": req.params.area },
            ],
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
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
        id: "$_id",
        word_name: 1,
        definition: 1,
      },
    },
  ])
    .then((search) => {
      const searchResults = [...search];
      let resultArray = [];
      let currentLanguages = [];
      let mapLanguages = [];

      fs.readFile(
        path.join(__dirname, "../../../images/my_europe_template.svg"),
        (err, data) => {
          if (err) throw err;
          let info = data.toString();
          const $ = cheerio.load(info, {
            normalizeWhitespace: true,
            xmlMode: true,
          });
          let langs = $("tspan");
          langs.each(function (i, el) {
            const lang = $(el).text();
            if (lang) {
              mapLanguages.push(lang.split("$")[1]);
            }
          });
          for (let result of searchResults) {
            if (!mapLanguages.includes(result.language.abbreviation)) {
              continue;
            }
            resultArray.push(romanizationHelper(result));
            currentLanguages.push(result.language.abbreviation);
          }

          let unusedMapLanguages = [];
          mapLanguages.forEach((mapLang) => {
            if (!currentLanguages.includes(mapLang)) {
              unusedMapLanguages.push(mapLang);
            }
          });

          unusedMapLanguages.forEach((unusedLang) => {
            info = info.replace("$" + unusedLang, "");
          });

          resultArray.forEach((language) => {
            info = info.replace(
              "$" + language["abbreviation"],
              language["translation"]
            );
          });

          console.log("writeFile fires");
          fs.writeFileSync(
            path.join(__dirname, "../../../images/my_europe_template_copy.svg"),
            info,
            function (err, result) {
              if (err) throw err;
              console.log("typeof result=", typeof result);
            }
          );
          console.log("file saved.");
        }
      );
    })
    .then(() => {
      res.setHeader("Content-Type", "image/svg+xml");
      res.sendFile(
        path.join(__dirname, "../../../images/my_europe_template_copy.svg")
      );
    })
    .catch((err) => {
      console.log("err=", err);
      res.status(404).json({ success: false, error: err });
    });
});
// 145 lines v1

// find_all_genders_by_area_img
// GET api/v1/translations/search/all_genders_by_area_img/:area/:word
// search translations by area from the europe map by GENDER
// @access = public
router.get("/search/all_genders_by_area_img/:area/:word", (req, res) => {
  console.log("find_all_genders_by_area_img FIRES");
  console.log("req.params.area=", req.params.area);
  console.log("req.params.word=", req.params.word);
  //prettier-ignore
  const myEuropeSvg = ["ab", "ar", "az", "be", "bg", "br", "ca", "co", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fi", "fo", "fr", "fy", "ga", "gag", "gd", "gl", "hu", "hy", "is", "it", "ka", "kk", "krl", "lb", "lij", "lt", "lv", "mk", "mt", "nap", "nl", "no", "oc", "os", "pl", "pms", "pt", "rm", "ro", "ru", "sc", "scn", "sco", "se", "sh", "sh", "sh", "sk", "sl", "sq", "sv", "tk", "tt", "uk", "vnc", "xal"];
  //prettier-ignore
  const Combo = [
        ["ab", "168d4f"],
        ["ar", "ffffb1"],
        ["az", "d45500"],
        ["be", "b5ff64"],
        ["bg", "36ae22"],
        ["br", "178df0"],
        ["ca", "00ffff"],
        ["co", "c0003c"],
        ["cs", "00cb60"],
        ["cy", "ff7f29"],
        ["da", "ff5555"],
        ["de", "d09999"],
        ["el", "ffff00"],
        ["en", "ffaaaa"],
        ["es", "acd8ed"],
        ["et", "b7c8be"],
        ["eu", "ffd42a"],
        ["fi", "6f997a"],
        ["fo", "ff0000"],
        ["fr", "53bbb5"],
        ["fy", "d66c74"],
        ["ga", "fd6d3c"],
        ["gag", "c837ab"],
        ["gd", "ff7f2a"],
        ["gl", "00d4aa"],
        ["hu", "ac9d93"],
        ["hy", "008080"],
        ["is", "f19076"],
        ["it", "7bafe0"],
        ["ka", "f4e3d7"],
        ["kk", "deaa87"],
        ["krl", "93ac93"],
        ["lb", "55ddff"],
        ["lij", "f2003c"],
        ["lt", "e9afdd"],
        ["lv", "de87cd"],
        ["mk", "71c837"],
        ["mt", "a0892c"],
        ["nap", "f5003c"],
        ["nl", "f4d7d7"],
        ["no", "ff8080"],
        ["oc", "168d5f"],
        ["os", "985fd3"],
        ["pl", "7ecb60"],
        ["pms", "f2d53c"],
        ["pt", "00d4d4"],
        ["rm", "008079"],
        ["ro", "aaccff"],
        ["ru", "72ff00"],
        ["sc", "c0ee3c"],
        ["scn", "cc003c"],
        ["sco", "168df0"],
        ["se", "cccccc"],
        ["sh", "abc837"],
        ["sk", "42f460"],
        ["sl", "81c98d"],
        ["sq", "a0856c"],
        ["sv", "ffb380"],
        ["tk", "cc9e4c"],
        ["tt", "c7a25f"],
        ["uk", "c1ff00"],
        ["vnc", "f28d3c"],
        ["xal", "d34d5f"],
      ]

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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            $or: [
              { "language.area1": req.params.area },
              { "language.area2": req.params.area },
              { "language.area3": req.params.area },
            ],
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
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
        id: "$_id",
        word_name: 1,
        definition: 1,
        // name: "$language.name",
        // family: "$language.family",
        // macrofamily: "$language.macrofamily",
      },
    },
  ])
    .then((search) => {
      const searchResults = [...search];
      // the languages on the default map
      const languagesArray = Combo.map((item) => item[0]);

      // the corresponding colors
      const colorCodesArray = Combo.map((item) => item[1]);

      // the results of transforming the data
      let resultArray = [];

      // the current langauges in the results
      let currentLanguages = [];

      // the current languages on the map.
      let mapLanguages = [];

      fs.readFile(
        path.join(__dirname, "../../../images/my_europe_template.svg"),
        (err, data) => {
          if (err) throw err;
          // use cheerio to get all the $??? off the svg map
          let info = data.toString();
          const $ = cheerio.load(info, {
            normalizeWhitespace: true,
            xmlMode: true,
          });
          let langsParsed = $("tspan");
          langsParsed.each(function (i, el) {
            const lang = $(el).text();
            if (lang) {
              mapLanguages.push(lang.split("$")[1]);
            }
          });

          console.log("searchResults=", searchResults[0]);
          // skip over languages that are results, but not on the map
          for (let result of searchResults) {
            if (!mapLanguages.includes(result.language.abbreviation)) {
              continue;
            }

            // skip results with no gender
            if (!result.gender) {
              continue;
            }

            // handle romanization
            let thisResult = romanizationHelper(result);

            const thisGender = result.gender ? result.gender : null;
            thisResult["gender"] = thisGender;
            resultArray.push(thisResult);
            currentLanguages.push(result.language.abbreviation);
          }

          // get the unused langs from the map. We are going to blank them out.
          let unusedMapLanguages = [];
          mapLanguages.forEach((mapLang) => {
            if (!currentLanguages.includes(mapLang)) {
              unusedMapLanguages.push(mapLang);
            }
          });

          // get the italian and french gender. to be the base for deleting later
          const italianIndex = resultArray.findIndex(
            (item) => item.abbreviation === "it"
          );
          const frenchIndex = resultArray.findIndex(
            (item) => item["abbreviation"] === "fr"
          );
          const italianGender =
            italianIndex > -1 ? resultArray[italianIndex]["gender"] : null;
          const frenchGender =
            frenchIndex > -1 ? resultArray[frenchIndex]["gender"] : null;

          // remove $___ text and decolor.
          // Regional langs match French/Italian
          // other langs are white
          unusedMapLanguages.forEach((unusedLang) => {
            const colorFromMap =
              colorCodesArray[languagesArray.indexOf(unusedLang)];
            const replaceColor = "#" + colorFromMap;
            const newRegex = new RegExp(replaceColor, "g");
            if (
              ["pms", "lij", "vnc", "nap", "scn", "sc"].includes(unusedLang) &&
              italianGender
            ) {
              info = info.replace(
                newRegex,
                "#" + genderColorFinder(italianGender)
              );
            } else if (
              ["oc", "co", "br"].includes(unusedLang) &&
              frenchGender
            ) {
              info = info.replace(
                newRegex,
                "#" + genderColorFinder(frenchGender)
              );
            } else {
              info = info.replace(newRegex, "#" + "ffffff");
            }
            info = info.replace("$" + unusedLang, "");
          });

          // Change "$__" to result
          resultArray.forEach((result) => {
            info = info.replace(
              "$" + result["abbreviation"],
              result["translation"]
            );
            const existingColor =
              colorCodesArray[languagesArray.indexOf(result["abbreviation"])];
            const replaceColor = "#" + existingColor;
            const newRegex = new RegExp(replaceColor, "g");
            info = info.replace(
              newRegex,
              "#" + genderColorFinder(result["gender"])
            );
          });
          //   langsParsed.each(function (i, el) {
          //     let lang = $(el).text().split("$")[1];
          //     if (currentLanguages.includes(lang)) {
          //       const index = resultArray.findIndex(
          //         (result) => result.abbreviation === lang
          //       );
          //       const colorFromMap =
          //         colorCodesArray[languagesArray.indexOf(lang)];
          //       info = info.replace(
          //         "$" + lang,
          //         resultArray[index]["translation"]
          //       );
          //       const replaceColor = "#" + colorFromMap;
          //       const newRegex = new RegExp(replaceColor, "g");
          //       info = info.replace(
          //         newRegex,
          //         "#" + genderColorFinder(resultArray[index]["gender"])
          //       );
          //     }
          //   });
          fs.writeFileSync(
            path.join(__dirname, "../../../images/my_europe_template_copy.svg"),
            info,
            function (err, result) {
              if (err) throw err;
              console.log("typeof result=", typeof result);
            }
          );
          console.log("file saved.");
        }
      );
    })
    .then(() => {
      res.setHeader("Content-Type", "image/svg+xml");
      res.sendFile(
        path.join(__dirname, "../../../images/my_europe_template_copy.svg")
      );
    })
    .catch((err) => {
      console.log("err=", err);
      res.status(404).json({ success: false, error: err });
    });
});
// 334 lines v1

// find_all_etymologies_by_area_img
// GET api/v1/translations/search/all_etymologies_by_area_img/:area/:word
// search translations by area from the europe map by ETYMOLOGY
// @access = public
router.get("/search/all_etymologies_by_area_img/:area/:word", (req, res) => {
  console.log("all_etymologies_by_area_img FIRES");
  console.log("req.params.area=", req.params.area);
  console.log("req.params.word=", req.params.word);
  //prettier-ignore
  const myEuropeSvg = ["ab", "ar", "az", "be", "bg", "br", "ca", "co", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fi", "fo", "fr", "fy", "ga", "gag", "gd", "gl", "hu", "hy", "is", "it", "ka", "kk", "krl", "lb", "lij", "lt", "lv", "mk", "mt", "nap", "nl", "no", "oc", "os", "pl", "pms", "pt", "rm", "ro", "ru", "sc", "scn", "sco", "se", "sh", "sk", "sl", "sq", "sv", "tk", "tt", "uk", "vnc", "xal"];
  //prettier-ignore
  const Combo = [
          ["ab", "168d4f"],
          ["ar", "ffffb1"],
          ["az", "d45500"],
          ["be", "b5ff64"],
          ["bg", "36ae22"],
          ["br", "178df0"],
          ["ca", "00ffff"],
          ["co", "c0003c"],
          ["cs", "00cb60"],
          ["cy", "ff7f29"],
          ["da", "ff5555"],
          ["de", "d09999"],
          ["el", "ffff00"],
          ["en", "ffaaaa"],
          ["es", "acd8ed"],
          ["et", "b7c8be"],
          ["eu", "ffd42a"],
          ["fi", "6f997a"],
          ["fo", "ff0000"],
          ["fr", "53bbb5"],
          ["fy", "d66c74"],
          ["ga", "fd6d3c"],
          ["gag", "c837ab"],
          ["gd", "ff7f2a"],
          ["gl", "00d4aa"],
          ["hu", "ac9d93"],
          ["hy", "008080"],
          ["is", "f19076"],
          ["it", "7bafe0"],
          ["ka", "f4e3d7"],
          ["kk", "deaa87"],
          ["krl", "93ac93"],
          ["lb", "55ddff"],
          ["lij", "f2003c"],
          ["lt", "e9afdd"],
          ["lv", "de87cd"],
          ["mk", "71c837"],
          ["mt", "a0892c"],
          ["nap", "f5003c"],
          ["nl", "f4d7d7"],
          ["no", "ff8080"],
          ["oc", "168d5f"],
          ["os", "985fd3"],
          ["pl", "7ecb60"],
          ["pms", "f2d53c"],
          ["pt", "00d4d4"],
          ["rm", "008079"],
          ["ro", "aaccff"],
          ["ru", "72ff00"],
          ["sc", "c0ee3c"],
          ["scn", "cc003c"],
          ["sco", "168df0"],
          ["se", "cccccc"],
          ["sh", "abc837"],
          ["sk", "42f460"],
          ["sl", "81c98d"],
          ["sq", "a0856c"],
          ["sv", "ffb380"],
          ["tk", "cc9e4c"],
          ["tt", "c7a25f"],
          ["uk", "c1ff00"],
          ["vnc", "f28d3c"],
          ["xal", "d34d5f"],
        ]

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
    {
      $lookup: {
        from: "words",
        localField: "word_name",
        foreignField: "word_name",
        as: "word",
      },
    },
    { $unwind: "$word_name" },
    {
      $match: {
        $and: [
          { word_name: req.params.word },
          {
            $or: [
              { "language.area1": req.params.area },
              { "language.area2": req.params.area },
              { "language.area3": req.params.area },
            ],
          },
        ],
      },
    },
    {
      _id: 0,
      etymology: 1,
      gender: 1,
      link: 1,
      romanization: 1,
      translation: 1,
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
      id: "$_id",
      word_name: 1,
      definition: 1,
      //   _id: 0,
      //   etymology: 1,
      //   gender: 1,
      //   link: 1,
      //   romanization: 1,
      //   translation: 1,
      //   id: "$_id",
      //   //   alive: "$language.alive",
      //   //   alphabet: "$language.alphabet",
      //   //   area1: "$language.area1",
      //   //   area2: "$language.area2",
      //   //   area3: "$language.area3",
      // //   abbreviation: "$language.abbreviation",
      // //   notes: "$language.notes",
      // //   family: "$language.family",
      // //   macrofamily: "$language.macrofamily",
      // //   subfamily: "$language.subfamily",
      // //   name: "$language.name",
      // //   word_name: "$word.word_name",
      // abbreviation: "$abbreviation",
      // notes: "$notes",
      // family: "$language.family",
      // macrofamily: "$language.macrofamily",
      // subfamily: "$language.subfamily",
      // name: "$language.name",
      // word_name: "$word.word_name",
    },
  ])
    .then((search) => {
      const searchResults = [...search];
      //  the languages on the default map
      const languagesArray = Combo.map((item) => item[0]);

      // the corresponding colors
      const colorCodesArray = Combo.map((item) => item[1]);

      // the results of transforming the data
      let resultArray = [];

      // the current langauges in the results
      let currentLanguages = [];

      // the current languages on the map.
      let mapLanguages = [];

      // the array that we compare to
      let etymologyArray = [];

      // track the array position
      let arrayCounter = 0;

      fs.readFile(
        path.join(__dirname, "../../../images/my_europe_template.svg"),
        (err, data) => {
          if (err) throw err;
          let info = data.toString();
          const $ = cheerio.load(info, {
            normalizeWhitespace: true,
            xmlMode: true,
          });
          let langs = $("tspan");
          langs.each(function (i, el) {
            const lang = $(el).text();
            if (lang) {
              mapLanguages.push(lang.split("$")[1]);
            }
          });
          //   console.log("mapLanguages=", mapLanguages);

          // Match logic:
          // get a result
          // check if it is on the map
          // check if it has an etymology
          // current_etymology_array - split the etymology by sentence, remove anything after first sentence
          // split first sentence on commas and semicolobs.
          // remove words. check this clean info for matches
          // get the families list. Match current_etymology_array[index] and family
          // if no matching_family, use the result.family
          // if no matching_etymology, use the result.etymology
          // get the index_in_ety_array of the matching etymology from etymology_array
          // build the etymology array
          // build the result array

          //prettier-ignore
          const removeWords = ["ultimately", "derived", "borrowed", "shortened", "by", "metathesis", "both", "all", "the", "voiced", "verner", "alternant", "classical", "with", "change", "of", "ending", "itself", "probably", "later", "vulgar", "a", "modification", "root", "or"]
          //prettier-ignore
          const familiesList = ["Albanian", "Anatolian", "Armenian", "Ancient Greek", "Hellenic", "Latin", "Proto-Balto‑Slavic", "Proto-Slavic", "Proto-Baltic", "Proto-Celtic", "Proto-Germanic", "Proto-Indo-Iranian", "Proto-Tocharian", "Proto-Finnic", "Proto-Sami", "Proto-Ugric", "Proto-Basque", "Proto-Turkic", "Proto-Afro-Asiatic" , "Semitic", "Arabic", "Proto-Kartvelian", "Proto-Northwest Caucasian", "Proto-Northeast Caucasian" ]

          for (let result of searchResults) {
            console.log(
              "result.language.abbreviation=",
              result.language.abbreviation
            );

            // skip results NOT on  the current map
            if (!mapLanguages.includes(result.language.abbreviation)) {
              continue;
            }

            // skip results with no etymology
            if (!result.etymology) {
              continue;
            }

            // create a clean array from the current etymology
            let currentEtymologyArray = result.etymology
              .replace(/\s\(.*?\)/g, "")
              .replace(/\s\[.*?\]/g, "")
              .split(".")[0]
              .split(/[,\s][;\s]/);

            // variables to get the matching info
            let matchingFamily = null;
            let matchingEtymology = null;
            let matched = false;

            // Prefer to match "Latin" instead of "Vulgar Latin"
            // Account for "from Vulgar Latin "xe", from Latin "x" confusion.
            // Remove Vulgar Latin if this is true.
            const numLatins = currentEtymologyArray.filter((phrase) =>
              phrase.includes("Latin")
            ).length;
            const vulgarLatinIndex = currentEtymologyArray.findIndex((phrase) =>
              phrase.includes("Vulgar Latin")
            );

            // remove "Vulgar Latin" if it exists and there is a Latin.
            if (numLatins > 1 && vulgarLatinIndex > -1) {
              currentEtymologyArray.splice(vulgarLatinIndex, 1);
            }

            let cleanEtymology = "";

            // loop over the currentEtymologyArray and match
            currentEtymologyArray.forEach((etymology) => {
              let cleanEtymology1 = etymology.split(" ");
              let cleanEtymology2 = cleanEtymology1.filter((word) => {
                return !removeWords.includes(word.toLowerCase());
              });
              cleanEtymology = cleanEtymology2.join(" ").trim();

              console.log("currentEtymologyArray=", currentEtymologyArray);
              console.log("cleanEtymology=", cleanEtymology);

              // loop over the families to try to match
              for (let i = 0; i < familiesList.length; i++) {
                const family = familiesList[i];
                console.log("family=", family);
                console.log("matched=", matched);
                if (
                  cleanEtymology.includes(`From ${family}`) ||
                  cleanEtymology.includes(`from ${family}`)
                ) {
                  matchingFamily = family;
                  matchingEtymology =
                    cleanEtymology.charAt(0).toUpperCase() +
                    cleanEtymology.slice(1);
                  matched = true;
                  console.log("MATCH");
                  console.log("matched=", matched);
                  console.log("matchingFamily=", matchingFamily);
                  console.log("matchingEtymology=", matchingEtymology);
                  console.log("\n");
                  break;
                }
                if (matched) {
                  break;
                }
              }
            });

            if (!matchingFamily) {
              //   console.log("!matchingFamily FIRES");
              matchingFamily = result.language.family;
            }
            if (!matchingEtymology) {
              //   console.log("!matchingEtymology FIRES");
              matchingEtymology = currentEtymologyArray[0];
            }

            const indexInEtymologyArray = etymologyArray.findIndex((item) => {
              return item && item["etymology"].includes(matchingEtymology);
            });

            if (!result.etymology) {
              let editedResult = romanizationHelper(result);
              editedResult["index"] = null;
              editedResult["color"] = "ffffff";
              resultArray.push(editedResult);
              // dont push into etymologyArray bc there is no ety
              // no foundColor.
            } else if (indexInEtymologyArray === -1) {
              let foundColor = "ffffff";
              if (languagesArray.indexOf(result["abbreviation"] > -1)) {
                foundColor =
                  colorCodesArray[
                    languagesArray.indexOf(result["language"]["abbreviation"])
                  ];
              }

              etymologyArray.push({
                etymology: matchingEtymology,
                languages: [result.language.abbreviation],
                color: foundColor,
                family: matchingFamily,
              });
              let editedResult = romanizationHelper(result);
              editedResult["index"] = arrayCounter;
              editedResult["color"] = foundColor;
              resultArray.push(editedResult);
              currentLanguages.push(result.language.abbreviation);
              arrayCounter++;
            } else {
              etymologyArray[indexInEtymologyArray]["languages"].push(
                result.language.abbreviation
              );
              foundColor = etymologyArray[indexInEtymologyArray]["color"];
              let editedResult = romanizationHelper(result);
              editedResult["index"] = arrayCounter;
              editedResult["color"] = foundColor;
              editedResult["family"] = matchingFamily;
              resultArray.push(editedResult);
              currentLanguages.push(result.language.abbreviation);
              // do not increment the counter
            }
          }

          const italianIndex = resultArray.findIndex((item) => {
            return item.abbreviation === "it";
          });
          const italianColor =
            italianIndex > -1 ? resultArray[italianIndex]["color"] : null;

          const frenchIndex = resultArray.findIndex((item) => {
            return item.abbreviation === "fr";
          });
          const frenchColor =
            frenchIndex > -1 ? resultArray[frenchIndex]["color"] : null;

          const englishIndex = resultArray.findIndex((item) => {
            return item.abbreviation === "en";
          });
          const englishColor =
            englishIndex > -1 ? resultArray[englishIndex]["color"] : null;

          //   console.log("italianColor=", italianColor);
          //   console.log("frenchColor=", frenchColor);
          //   console.log("englishColor=", englishColor);

          // get the unused langs off the map. We are going to blank them out.
          let unusedMapLanguages = [];
          mapLanguages.forEach((lang) => {
            if (!currentLanguages.includes(lang)) {
              unusedMapLanguages.push(lang);
            }
          });

          // remove $___ text and decolor. Regional langs match French/Italian
          unusedMapLanguages.forEach((unusedLang) => {
            const colorFromMap =
              colorCodesArray[languagesArray.indexOf(unusedLang)];
            const replaceColor = "#" + colorFromMap;
            const newRegex = new RegExp(replaceColor, "g");
            if (
              ["pms", "lij", "vnc", "nap", "scn", "sc"].includes(unusedLang) &&
              italianColor
            ) {
              info = info.replace(newRegex, "#" + italianColor);
            } else if (["oc", "co", "br"].includes(unusedLang) && frenchColor) {
              info = info.replace(newRegex, "#" + frenchColor);
            } else if (["sco"].includes(unusedLang) && englishColor) {
              info = info.replace(newRegex, "#" + englishColor);
            } else {
              info = info.replace(newRegex, "#" + "ffffff");
            }
            info = info.replace("$" + unusedLang, "");
          });

          //   Change "$__" to result
          resultArray.forEach((result) => {
            info = info.replace(
              "$" + result["abbreviation"],
              result["translation"]
            );
            const existingColor =
              colorCodesArray[languagesArray.indexOf(result["abbreviation"])];
            const replaceColor = "#" + existingColor;
            const newRegex = new RegExp(replaceColor, "g");
            info = info.replace(newRegex, "#" + result["color"]);
          });
          console.log("\n");
          console.log(
            `${searchResults.length} matching languages in the DB for the word: ${req.params.word} in: ${req.params.area}`
          );
          console.log(`${mapLanguages.length} languages on the map`);
          console.log(`${unusedMapLanguages.length} unused languages`);
          console.log(unusedMapLanguages.sort());
          console.log(`${currentLanguages.length} languages displayed`);
          console.log(`${etymologyArray.length} <== unique etymologies`);
          //   console.log("myEuropeSvg=", myEuropeSvg);
          //   console.log("mapLanguages=", mapLanguages.sort());
          //   console.log(
          //     "mapLanguages.length===myEuropeSvg.length",
          //     mapLanguages.length === myEuropeSvg.length
          //   );
          console.log(
            `${
              myEuropeSvg.length - mapLanguages.length
            } languages missing between the two arrays`
          );
          console.log("\n");
          fs.writeFileSync(
            path.join(__dirname, "../../../images/my_europe_template_copy.svg"),
            info,
            function (err, result) {
              if (err) throw err;
              console.log("typeof result=", typeof result);
            }
          );

          console.log("file saved.");
        }
      );
    })
    .then(() => {
      res.setHeader("Content-Type", "image/svg+xml");
      res.sendFile(
        path.join(__dirname, "../../../images/my_europe_template_copy.svg")
      );
    })
    .catch((err) => {
      console.log("err=", err);
      res.status(404).json({ success: false, error: err });
    });
});
// 529 lines v1

//  Appends romanization if not the same as translation
//  example [nl, water], ["uk", "мідь - midʹ"]
function romanizationHelper(result) {
  if (result.translation === result.romanization) {
    return {
      abbreviation: `${result.language.abbreviation}`,
      translation: `${result.translation}`,
    };
  } else {
    return {
      abbreviation: `${result.language.abbreviation}`,
      translation: `${result.translation} - ${result.romanization}`,
    };
  }
}

// covert a text gender "m"/"f" whatever to the right color code
function genderColorFinder(gender) {
  switch (gender) {
    case "m":
      return "87CEFA";
    case "m anim":
      return "87CEFA";
    case "m inan":
      return "87CEFA";
    case "m pl":
      return "87CEFA";
    case "m or f":
      return "87CEFA";
    case "m or n":
      return "87CEFA";
    case "f":
      return "FFC0CB";
    case "f pl":
      return "FFC0CB";
    case "f inan":
      return "FFC0CB";
    case "f or m":
      return "FFC0CB";
    case "n":
      return "D3D3D3";
    case "n inan":
      return "D3D3D3";
    case "c":
      return "EE82EE";
    default:
      return "ffffff";
  }
}
module.exports = router;

// [x]find_all_translations_by_word
// []find_all_translations_by_gender
// [x]find_etymology_containing
// [x]find_all_translations_by_macrofamily
// [x]find_all_translations_by_language
// [x]find_all_translations_by_area
// [x]translations_count
// [x]seeds

// # Mappers
// [x]find_all_translations_by_area_europe_map
// [x]find_all_translations_by_area_img
// [x]find_all_genders_by_area_img
// [x]find_all_etymologies_by_area_img
// []find info
