const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WordSchema = new Schema(
  {
    word_name: {
      type: String,
      required: [true, "please enter a word name"],
    },
    definition: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = Word = mongoose.model("word", WordSchema);
