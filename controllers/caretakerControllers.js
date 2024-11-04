const JWT = require("jsonwebtoken");
const caretakerModel = require("../models/caretaker");
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
    const caretaker = await caretakerModel.findOne({ email: email });
    if (caretaker) {
      return res.status(400).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // hashed password
    const hashedPassowrd = await hashPassword(password);

    // save user
    const newCaretaker = await caretakerModel({
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
      message: "Error in Caretaker SignUp API",
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
    const caretaker = await caretakerModel.findOne({ email: email });
    if (caretaker) {
      const isSamePassword = await comparePassword(
        password,
        caretaker.password
      );
      if (isSamePassword) {
        caretaker.password = undefined;
        //TOKEN JWT
        const token = await JWT.sign(
          { _id: caretaker._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          success: true,
          message: "Login success",
          token,
          user: caretaker,
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
        message: "No registered caretaker found with given email",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error in Caretaker LogIn API",
      error: error,
    });
  }
};
