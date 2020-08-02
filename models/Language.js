const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LanguageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  abbreviation: {
    type: String,
    required: true,
  },
  alphabet: {
    type: String,
    required: false,
  },
  macrofamily: {
    type: String,
    required: false,
  },
  family: {
    type: String,
    required: false,
  },
  subfamily: {
    type: String,
    required: false,
  },
  area1: {
    type: String,
    required: false,
  },
  area2: {
    type: String,
    required: false,
  },
  area3: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  alive: {
    type: Boolean,
    required: true,
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

module.exports = Language = mongoose.model("language", LanguageSchema);
