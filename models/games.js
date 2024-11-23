const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Game image is required"], // Base64 string
    },
    html: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
