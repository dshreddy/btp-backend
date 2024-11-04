const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please add email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      trim: true,
      min: 6,
      max: 64,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
