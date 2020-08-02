const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TranslationSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Translation = mongoose.model("translation", TranslationSchema);
