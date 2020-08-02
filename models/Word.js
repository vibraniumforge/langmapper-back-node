const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  word_name: {
    type: String,
    required: [true, "please enter a word name"],
  },
  definition: {
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

module.exports = Word = mongoose.model("word", WordSchema);
