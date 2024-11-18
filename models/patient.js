const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    dob: {
      type: String,
      required: [true, "Please add DOB"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Please add gender"],
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
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
