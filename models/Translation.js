const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const TranslationSchema = new Schema(
  {
    word_name: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    etymology: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    romanization: {
      type: String,
      required: false,
    },
    translation: {
      type: String,
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);

TranslationSchema.index({ etymology: "text" }, { language_override: "dummy" });

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

// find_all_translations_by_word
// GET api/v1/translations/search/word/:word
// search translations by word
// @access = public
TranslationSchema.statics.finAllTranslationsByWord = function (word) {
  return mongoose.model("Translation").aggregate([
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
    { $match: { word_name: word } },
    { $sort: { "language.name": 1 } },
    {
      $project: {
        _id: 0,
        id: "$_id",

        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language_id: "$language._id",
        word_id: "$word._id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
        language: {
          id: "$language._id",
        },
        word: {
          id: "$word._id",
        },
      },
    },
  ]);
};

// DONE
// find_all_translations_by_word_gender
// GET api/v1/translations/search/gender/:word
// search translations by word
// @access = public
TranslationSchema.statics.finAllTranslationsByWordGender = function (word) {
  return mongoose.model("Translation").aggregate([
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
          { word_name: word },
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
        id: "$_id",
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        language_id: "$language._id",
        word_id: "$word._id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
        language: {
          id: "$language._id",
        },
        word: {
          id: "$word._id",
        },
      },
    },
  ]);
};

// DONE
// find_etymology_containing
// GET api/v1/translations/search/etymology/:word
// search translations by word containing an etymology
// @access = public
TranslationSchema.statics.findEtymologyContaining = function (word) {
  return mongoose.model("Translation").aggregate([
    {
      $match: {
        $text: {
          $search: word,
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
    { $unwind: "$word" },
    {
      $project: {
        _id: 0,
        id: "$_id",
        language_id: "$language._id",
        word_id: "$word._id",
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        name: "$language.name",
        // language: {
        //   id: "$language._id",
        // },
        // word: {
        //   id: "$word._id",
        // },
      },
    },
  ]);
};

// DONE
// find_all_translations_by_macrofamily
// GET api/v1/translations/search/macrofamily/:macrofamily
// search translations by macrofamily
// @access = public
TranslationSchema.statics.findAllTranslationsByMacrofamily = function (
  macrofamily
) {
  return mongoose.model("Translation").aggregate([
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
    { $match: { "language.macrofamily": macrofamily } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        language_id: "$language._id",
        word_id: "$word._id",
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        name: "$language.name",
        family: "$language.family",
        language: {
          id: "$language._id",
        },
        word: {
          id: "$word._id",
        },
      },
    },
  ]);
};

// DONE
// find_all_translations_by_language
// GET api/v1/translations/search/language/:language/
// search translations by language
// @access = public
TranslationSchema.statics.findAllTranslationsByLanguage = function (language) {
  return mongoose.model("Translation").aggregate([
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
    { $match: { "language.name": language } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        language_id: "$language._id",
        word_id: "$word._id",
        etymology: 1,
        gender: 1,
        link: 1,
        romanization: 1,
        translation: 1,
        word_name: 1,
        name: "$language.name",
        family: "$language.family",
        language: {
          id: "$language._id",
        },
        word: {
          id: "$word._id",
        },
      },
    },
  ]);
};

// DONE
// find_all_translations_by_area
// GET api/v1/translations/search/area/:area/:word
// search translation by area
// @access = public
TranslationSchema.statics.findAllTranslationsByArea = function (area, word) {
  return mongoose.model("Translation").aggregate([
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
          { word_name: word },
          {
            $or: [
              { "language.area1": area },
              { "language.area2": area },
              { "language.area3": area },
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
        language_id: "$language._id",
        word_id: "$word._id",
        name: "$language.name",
        family: "$language.family",
        macrofamily: "$language.macrofamily",
        subfamily: "$language.subfamily",
        abbreviation: "$language.subfamily",
      },
    },
  ]);
};

// DONE
// find_all_translations_by_area_europe_map
// GET api/v1/translations/search/area_europe_map/:area/:word
// search translation by area FROM THE EUROPE MAP ONLY
// @access = public
TranslationSchema.statics.findAllTranslationsByAreaEuropeMap = function (
  area,
  word
) {
  return mongoose.model("Translation").aggregate([
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
          { word_name: word },
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
        abbreviation: "$language.subfamily",
      },
    },
  ]);
};

// ----------------------------------------------
// MAPPERS

// DONE
// find_all_translations_by_area_img
// GET api/v1/translations/search/all_translations_by_area_img/:area/:word
// search translation by area and from the europe map by TRANSLATION
// @access = public
TranslationSchema.statics.findAllTranslationsByAreaImg = async function (
  area,
  word
) {
  try {
    const searchResults = await mongoose.model("Translation").aggregate([
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
            { word_name: word },
            {
              $or: [
                { "language.area1": area },
                { "language.area2": area },
                { "language.area3": area },
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
          abbreviation: "$language.subfamily",
        },
      },
    ]);
    return searchResults;
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }

  console.log("searchResults=", searchResults);

  let resultArray = [];
  let currentLanguages = [];
  let mapLanguages = [];

  fs.readFile(
    path.join(__dirname, "../images/my_europe_template.svg"),
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
        path.join(__dirname, "../images/my_europe_template_copy.svg"),
        info,
        function (err, result) {
          if (err) throw err;
          console.log("typeof result=", typeof result);
        }
      );
      console.log("file saved.");
      console.log("sendFile fires");
      const options = {
        headers: {
          "Content-Type": "image/svg+xml",
          "x-timestamp": Date.now(),
        },
      };
      res.sendFile(
        path.join(__dirname, "../images/my_europe_template_copy.svg"),
        options,
        (err) => {
          if (err) {
            console.log("Err=", err);
          } else {
            console.log("file sent");
          }
        }
      );
    }
  );
  return "FIX MY RETURN VALUE";
};

// find_all_genders_by_area_img
// GET api/v1/translations/search/all_genders_by_area_img/:area/:word
// search translations by area from the europe map by GENDER
// @access = public
TranslationSchema.statics.findAllGendersByAreaImg = function (area, word) {
  return mongoose.model("Translation").aggregate([
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
          { word_name: word },
          {
            $or: [
              { "language.area1": area },
              { "language.area2": area },
              { "language.area3": area },
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
        abbreviation: "$language.subfamily",
      },
    },
  ]);
};

// find_all_etymologies_by_area_img
// GET api/v1/translations/search/all_etymologies_by_area_img/:area/:word
// search translations by area from the europe map by ETYMOLOGY
// @access = public
TranslationSchema.statics.findAllEtymologiesByAreaImg = function (area, word) {
  return mongoose.model("Translation").aggregate([
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
          { word_name: word },
          {
            $or: [
              { "language.area1": area },
              { "language.area2": area },
              { "language.area3": area },
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
        abbreviation: "$language.subfamily",
      },
    },
  ]);
};

module.exports = Translation = mongoose.model("Translation", TranslationSchema);
