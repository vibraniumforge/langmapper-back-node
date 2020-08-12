const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LanguageSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

LanguageSchema.statics.findLanguagesByArea = function (area) {
  return mongoose.model("Language").aggregate([
    {
      $match: {
        $or: [{ area1: area }, { area2: area }, { area3: area }],
      },
    },
    {
      $project: {
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
      },
    },
  ]);
};

module.exports = Language = mongoose.model("Language", LanguageSchema);
