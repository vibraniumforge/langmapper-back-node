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

WordSchema.statics.allWordNames = function () {
  return mongoose.model("Word").aggregate([
    {
      $project: {
        _id: 0,
        id: "$_id",
        word_name: 1,
      },
    },
    { $sort: { word_name: 1 } },
  ]);
};

WordSchema.statics.findWordDefinition = function (word) {
  const findWordDefinitionProject = {
    _id: 1,
    id: "$_id",
    definition: 1,
  };
  return mongoose
    .model("Word")
    .findOne({ word_name: word }, findWordDefinitionProject);
};

module.exports = Word = mongoose.model("Word", WordSchema);
