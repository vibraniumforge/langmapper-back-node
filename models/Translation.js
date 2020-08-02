const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    },
  },
  { timestamps: true }
);

module.exports = Translation = mongoose.model("translation", TranslationSchema);
