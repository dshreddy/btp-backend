const JWT = require("jsonwebtoken");
const doctorModel = require("../models/doctor");
const careTakerModel = require("../models/caretaker");
const patientModel = require("../models/patient");
const { hashPassword, comparePassword } = require("../utils/auth");
var { expressjwt: jwt } = require("express-jwt");

//middleware
const requireSingIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

module.exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password || password.length < 6 || password.length > 60) {
      return res.status(400).send({
        success: false,
        message:
          "Password is required and it's length should be in range [6, 60]",
      });
    }

    // existing user
    const existingDoctor = await doctorModel.findOne({ email: email });
    if (existingDoctor) {
      return res.status(400).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // hashed password
    const hashedPassowrd = await hashPassword(password);

    // save user
    const newDoctor = await doctorModel({
      name,
      email,
      password: hashedPassowrd,
    }).save();

    return res.status(200).send({
      success: true,
      message: "Registration successfull",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error in Doctor SignUp API",
      error: error,
    });
  }
};

module.exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Password is required",
      });
    }

    // existing user
    const doctor = await doctorModel.findOne({ email: email });
    if (doctor) {
      const isSamePassword = await comparePassword(password, doctor.password);
      if (isSamePassword) {
        doctor.password = undefined;
        //TOKEN JWT
        const token = await JWT.sign(
          { _id: doctor._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          success: true,
          message: "Login success",
          token,
          user: doctor,
        });
      } else {
        return res.status(400).send({
          success: false,
          message: "Incorrect password",
        });
      }
    } else {
      return res.status(400).send({
        success: false,
        message: "No registered doctor found with given email",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error in Doctor LogIn API",
      error: error,
    });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    // Find the doctor by email
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Update name if provided
    if (name) {
      doctor.name = name;
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).send({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      doctor.password = await hashPassword(password);
    }

    // Save updated doctor details
    await doctor.save();

    // Remove password from response
    doctor.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Details updated successfully",
      user: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error updating doctor details",
      error: error.message,
    });
  }
};

const fs = require("fs");
const path = require("path");

module.exports.addMedicine = async (req, res) => {
  try {
    const { doctor, medicineName, image } = req.body;

    // Validate input
    if (!doctor || !doctor._id) {
      return res.status(400).send({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (!medicineName) {
      return res.status(400).send({
        success: false,
        message: "Medicine name is required",
      });
    }

    if (!image) {
      return res.status(400).send({
        success: false,
        message: "Medicine image is required",
      });
    }

    const doctorID = doctor._id;

    // Find the doctor
    const existingDoctor = await doctorModel.findById(doctorID);
    if (!existingDoctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Add medicine to doctor's medicines array
    const newMedicine = { name: medicineName, image };
    existingDoctor.medicines.push(newMedicine);

    // Save updated doctor record
    await existingDoctor.save();

    return res.status(200).send({
      success: true,
      message: "Medicine added successfully",
      user: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error adding medicine",
      error: error.message,
    });
  }
};

module.exports.addPatient = async (req, res) => {
  try {
    const { doctor, name, dob, gender, mobile, password, caretakerEmail } =
      req.body;

    if (
      !doctor ||
      !name ||
      !dob ||
      !gender ||
      !mobile ||
      !password ||
      !caretakerEmail
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required.",
      });
    }

    const doctorID = doctor._id;

    // Find the doctor
    const existingDoctor = await doctorModel.findById(doctorID);
    if (!existingDoctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if caretaker exists
    const existingCaretaker = await careTakerModel.findOne({
      email: caretakerEmail,
    });
    if (!existingCaretaker) {
      return res.status(404).send({
        success: false,
        message: "Caretaker with the given email does not exist.",
      });
    }

    // Create new patient
    const hashedPassword = await hashPassword(password);

    const newPatient = new patientModel({
      name,
      dob,
      gender,
      mobile,
      password: hashedPassword,
      doctor: doctor._id,
      careTaker: existingCaretaker._id,
    });

    // Save patient
    await newPatient.save();

    // Add patient ID to doctor's patients array
    existingDoctor.patients.push(newPatient._id);
    await existingDoctor.save();

    existingCaretaker.patients.push(newPatient._id);
    await existingCaretaker.save();

    res.status(201).send({
      success: true,
      message: "Patient added successfully.",
      user: existingDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error adding patient.",
    });
  }
};

module.exports.getPatients = async (req, res) => {
  try {
    const { doctorId } = req.body;

    // Validate input
    if (!doctorId) {
      return res.status(400).send({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Find the doctor and populate the patients array
    const existingDoctor = await doctorModel
      .findById(doctorId)
      .populate("patients");
    if (!existingDoctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Return the list of patients
    res.status(200).send({
      success: true,
      message: "Patients retrieved successfully",
      patients: existingDoctor.patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).send({
      success: false,
      message: "Error retrieving patients",
      error: error.message,
    });
  }
};
