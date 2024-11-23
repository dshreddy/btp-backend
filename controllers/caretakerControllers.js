const JWT = require("jsonwebtoken");
const caretakerModel = require("../models/caretaker");
const { hashPassword, comparePassword } = require("../utils/auth");
var { expressjwt: jwt } = require("express-jwt");
const patientModel = require("../models/patient");
const fetch = require("node-fetch");
const serviceAccount = require("../../btp-mentalhealthapp-firebase-adminsdk-3bhql-26bcb873e8.json");

//middleware
const requireSingIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

const sendNotification = async (deviceToken, messageTitle, messageBody) => {
  const url = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

  const body = {
    message: {
      token: deviceToken,
      notification: {
        title: messageTitle,
        body: messageBody,
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("Notification Response:", data);
};

const getAccessToken = async () => {
  const { google } = require("google-auth-library");
  const client = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const tokens = await client.authorize();
  return tokens.access_token;
};

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

module.exports.update = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate the email
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    // Find the caretaker by email
    const caretaker = await caretakerModel.findOne({ email });
    if (!caretaker) {
      return res.status(404).send({
        success: false,
        message: "caretaker not found",
      });
    }

    // Update name if provided
    if (name) {
      caretaker.name = name;
    }

    // Updat password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).send({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      caretaker.password = await hashPassword(password);
    }

    // Save updated caretaker details
    await caretaker.save();

    // Remove password from response
    caretaker.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Details updated successfully",
      user: caretaker,
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

module.exports.getPatients = async (req, res) => {
  try {
    const { caretakerId } = req.body;

    // validate input
    if (!caretakerId) {
      return res.status(400).send({
        success: false,
        message: "Caretaker ID is required",
      });
    }

    // Find the caretaker and populate the patients array
    const existingCaretaker = await caretakerModel
      .findById(caretakerId)
      .populate("patients");
    if (!existingCaretaker) {
      return res.status(404).send({
        success: false,
        message: "Caretaker not found",
      });
    }

    // Return the list of patients
    res.status(200).send({
      success: true,
      message: "Patients retrieved successfully",
      patients: existingCaretaker.patients,
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

module.exports.notifyPatient = async (req, res) => {
  try {
    const { patientId } = req.body;
    // validate input
    if (!patientId) {
      return res.status(400).send({
        success: false,
        message: "Patient ID is reqired",
      });
    }

    // get the device token store in the patient table
    const existingPatient = await patientModel.findById(patientId);

    // find the device token and send notification
    if (!existingPatient || !existingPatient.deviceToken) {
      return res.status(400).send({
        success: false,
        message: "Patient Id not found ",
      });
    }

    // Trigger a notification (example with Firebase Cloud Messaging)
    const title = "Hey buddy";
    const body = `Its time to take your medications ✌️`;

    // Assume `patient.deviceToken` stores their device's FCM token
    const response = await sendNotification(
      existingPatient.deviceToken,
      title,
      body
    );

    return res
      .status(200)
      .json({ message: "Notification sent successfully.", response });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).send({
      success: false,
      message: "Error sending notificaiton to patient",
      error: error.message,
    });
  }
};
