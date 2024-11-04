const JWT = require("jsonwebtoken");
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
    const patient = await patientModel.findOne({ email: email });
    if (patient) {
      return res.status(400).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // hashed password
    const hashedPassowrd = await hashPassword(password);

    // save user
    const newPatient = await patientModel({
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
      message: "Error in Patient SignUp API",
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
    const patient = await patientModel.findOne({ email: email });
    if (patient) {
      const isSamePassword = await comparePassword(password, patient.password);
      if (isSamePassword) {
        patient.password = undefined;
        //TOKEN JWT
        const token = await JWT.sign(
          { _id: patient._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          success: true,
          message: "Login success",
          token,
          user: patient,
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
        message: "No registered patient found with given email",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error in patient LogIn API",
      error: error,
    });
  }
};
