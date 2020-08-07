const express = require("express");
const router = express.Router();
const Translation = require("../../../models/Translation.js");
const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

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
    { $match: { word_name: req.params.word } },
  ])
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
      $project: {
        _id: 1,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        // area1: 1,
        // area2: 1,
        // area3: 1,
      },
    },
  ])
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

// find_all_translations_by_area_europe_map
// GET api/v1/translations/search/area_europe_map/:area/:word
// search translation by area from the europe map
// @access = public
router.get("/search/area_europe_map/:area/:word", (req, res) => {
  //prettier-ignore
  const myEuropeSvg = ["ab", "ar", "az", "be", "bg", "br", "ca", "co", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fi", "fo", "fr", "fy", "ga", "gag", "gd", "gl", "hu", "hy", "is", "it", "ka", "kk", "krl", "lb", "lij", "lt", "lv", "mk", "mt", "nap", "nl", "no", "oc", "os", "pl", "pms", "pt", "rm", "ro", "ru", "sc", "scn", "sco", "se", "sh", "sh", "sh", "sk", "sl", "sq", "sv", "tk", "tt", "uk", "vnc", "xal"];
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
          { "language.abbreviation": { $in: myEuropeSvg } },
          { word_name: req.params.word },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        // area1: 1,
        // area2: 1,
        // area3: 1,
      },
    },
    {
      $project: {
        _id: 1,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        // area1: 1,
        // area2: 1,
        // area3: 1,
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

// find_all_translations_by_area_img
// GET api/v1/translations/search/all_translations_by_area_img/:area/:word
// search translation by area and create map
// @access = public
router.get("/search/all_translations_by_area_img/:area/:word", (req, res) => {
  console.log("find_all_translations_by_area_img FIRES");
  console.log("req.params.word=", req.params.word);
  //prettier-ignore
  const myEuropeSvg = ["ab", "ar", "az", "be", "bg", "br", "ca", "co", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fi", "fo", "fr", "fy", "ga", "gag", "gd", "gl", "hu", "hy", "is", "it", "ka", "kk", "krl", "lb", "lij", "lt", "lv", "mk", "mt", "nap", "nl", "no", "oc", "os", "pl", "pms", "pt", "rm", "ro", "ru", "sc", "scn", "sco", "se", "sh", "sh", "sh", "sk", "sl", "sq", "sv", "tk", "tt", "uk", "vnc", "xal"];

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
          { "language.abbreviation": { $in: myEuropeSvg } },
          { word_name: req.params.word },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        // area1: 1,
        // area2: 1,
        // area3: 1,
      },
    },
    {
      $project: {
        _id: 1,
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language: 1,
        word_name: 1,
        // area1: 1,
        // area2: 1,
        // area3: 1,
      },
    },
  ])
    .then((search) => {
      const searchResults = [...search];
      let resultArray = [];
      let currentLanguages = [];
      let mapLanguages = [];
      let counter = 0;

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
            let lang = $(el).text();
            if (lang) {
              mapLanguages.push(lang.split("$")[1]);
            }
          });
          for (let result of searchResults) {
            if (!mapLanguages.includes(result.language.abbreviation)) {
              continue;
            }
            // add roman helper later
            // result_array << romanization_helper(result)[0].to_h
            // console.log(result);
            resultArray.push({
              abbreviation: `${result.language.abbreviation}`,
              translation: `${result.translation}`,
            });
            currentLanguages.push(result.language.abbreviation);
          }
          //   console.log("mapLanguages=", mapLanguages);
          //   console.log("searchResults[0]=", searchResults[0]);
          //   console.log("resultArray[0]=", resultArray[0]);

          let unusedMapLanguages = [];
          mapLanguages.forEach((lang) => {
            if (!currentLanguages.includes(lang)) {
              unusedMapLanguages.push(lang);
            }
          });
          //   console.log("unusedMapLanguages=", unusedMapLanguages);
          unusedMapLanguages.forEach((lang) => {
            info = info.replace("$" + lang, "");
          });
          langs.each(function (i, el) {
            let lang = $(el).text().split("$")[1];
            // console.log("lang=", lang);
            if (currentLanguages.includes(lang)) {
              const index = currentLanguages.indexOf(lang);
              //   console.log("index=", index);
              //   console.log("currentLanguages[index]=", currentLanguages[index]);
              //   console.log(
              //     'resultArray[index]["translation"]=',
              //     resultArray[index]["translation"]
              //   );
              // console.log(index);
              // console.log(resultArray[index]["translation"]);
              // $(el).text(resultArray[index]["translation"]);
              info = info.replace(
                "$" + lang,
                resultArray[index]["translation"]
              );
            }
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
      //   res.json({
      //     message: `All Translations of ${req.params.word} in ${req.params.area} successfully returned.`,
      //     success: true,
      //   });
      res.setHeader("Content-Type", "image/svg+xml");
      res.sendFile(
        path.join(__dirname, "../../../images/my_europe_template_copy.svg")
      );
    })
    .then(() => {
      console.log(
        "path=",
        path.join(__dirname, "../../../images/my_europe_template_copy.svg")
      );
    })
    .catch((err) => {
      console.log("err=", err);
      res.status(404).json({ success: false, error: err });
    });
});

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
// []find_all_translations_by_area_img
// []find_all_genders_by_area_img
// []find_all_etymologies_by_area_img
// []find info
