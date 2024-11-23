const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
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
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
    medicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
