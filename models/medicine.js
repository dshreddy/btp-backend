const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Medicine image is required"], // Base64 string
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
