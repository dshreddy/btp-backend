const JWT = require("jsonwebtoken");
const doctorModel = require("../models/doctor");
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

    console.log(doctor.__id);

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
