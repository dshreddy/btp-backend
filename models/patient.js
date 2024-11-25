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
    mobile: {
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
    careTaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
    },
    medicines: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        mealTime: {
          type: String,
          enum: ["before", "after"],
          required: true,
        },
        dosage: {
          type: Number,
          required: true,
        },
        dosageTimes: {
          type: [String], // Array of strings for dosage times (e.g., ["08:00", "14:00", "20:00"])
          required: true,
        },
      },
    ],
    deviceToken: {
      type: String,
      required: false, // Optional, as it may not always be available
      trim: true,
    },
    games: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        default: [],
      },
    ],
    activity: {
      type: Map,
      of: [Number], // Each game ID maps to an array of scores
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
