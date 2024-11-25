const JWT = require("jsonwebtoken");
const patientModel = require("../models/patient");
const medicineModel = require("../models/medicine");
const gameModel = require("../models/games");
const { comparePassword } = require("../utils/auth");
var { expressjwt: jwt } = require("express-jwt");
const patient = require("../models/patient");

//middleware
const requireSingIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

module.exports.logIn = async (req, res) => {
  try {
    // front-end sends 1st field with email name
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
    const patient = await patientModel.findOne({ mobile: email });
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
        message: "No registered patient found with given mobile number",
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

module.exports.updateDeviceToken = async (req, res) => {
  try {
    const { patientId, deviceToken } = req.body;

    // Validate the input
    if (!patientId || !deviceToken) {
      return res.status(400).send({
        success: false,
        message: "Patient ID and Device Token are required",
      });
    }

    // Find the patient by ID
    const patient = await patientModel.findById(patientId);

    if (!patient) {
      return res.status(404).send({
        success: false,
        message: "Patient ID is required",
      });
    }

    patient.deviceToken = deviceToken;
    await patient.save();

    console.log(deviceToken);
    return res.status(200).send({
      success: true,
      message: "Device token updated successfully",
      data: { patientId: patient._id, deviceToken: patient.deviceToken },
    });
  } catch (error) {
    console.error("Error updating device token:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the device token",
    });
  }
};

module.exports.getMedicine = async (req, res) => {
  try {
    const { patientId } = req.body;

    // Validate input
    if (!patientId) {
      return res.status(400).send({
        success: false,
        message: "Patient ID is required",
      });
    }

    // Find the patient and populate the medicines array
    const existingPatient = await patientModel.findById(patientId).populate({
      path: "medicines.medicine", // Nested populate to get medicine details
      model: "Medicine",
    });

    if (!existingPatient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found",
      });
    }
    // Return the list of medicines
    res.status(200).send({
      success: true,
      message: "Medicines retrieved successfully",
      medicines: existingPatient.medicines,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving medicines",
      error: error.message,
    });
  }
};

module.exports.addGame = async (req, res) => {
  try {
    const { patientId, gameId } = req.body;

    // Validate input
    if (!patientId || !gameId) {
      return res.status(400).send({
        success: false,
        message: "Patient ID and Game ID are required.",
      });
    }

    // Find the patient
    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found.",
      });
    }

    // Find the game
    const game = await gameModel.findById(gameId);
    if (!game) {
      return res.status(404).send({
        success: false,
        message: "Game not found.",
      });
    }

    // Check if the game is already added
    if (patient.games.includes(gameId)) {
      return res.status(200).send({
        success: true,
        message: "Game is already added for this patient.",
      });
    }

    // Add the game to the patient's games array
    patient.games.push(gameId);

    // Save the updated patient
    await patient.save();

    return res.status(200).send({
      success: true,
      message: "Game added successfully.",
      patient,
    });
  } catch (error) {
    console.error("Error adding game:", error);
    res.status(500).send({
      success: false,
      message: "Error adding game to patient.",
      error: error.message,
    });
  }
};

module.exports.getGames = async (req, res) => {
  try {
    const { patientId } = req.body;

    // Validate input
    if (!patientId) {
      return res.status(400).send({
        success: false,
        message: "Patient ID is required",
      });
    }

    // Find the patient and populate the medicines array
    const existingPatient = await patientModel
      .findById(patientId)
      .populate("games");

    if (!existingPatient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found",
      });
    }

    // Return the list of medicines
    res.status(200).send({
      success: true,
      message: "Games retrieved successfully",
      games: existingPatient.games,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving games",
      error: error.message,
    });
  }
};

module.exports.updateGameActivity = async (req, res) => {
  try {
    const { patientId, gameId, score } = req.body;

    // Validate input
    if (!patientId || !gameId || score === undefined) {
      return res.status(400).send({
        success: false,
        message: "Patient ID, Game ID, and score are required.",
      });
    }

    // Find the patient
    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found.",
      });
    }

    // Get or initialize the activity for the game
    const gameScores = patient.activity.get(gameId) || [];

    // Add the new score and limit to the last 10 scores
    gameScores.push(score);
    if (gameScores.length > 10) {
      gameScores.shift(); // Remove the oldest score
    }

    // Update the activity map
    patient.activity.set(gameId, gameScores);

    // Save the updated patient document
    await patient.save();

    res.status(200).send({
      success: true,
      message: "Game activity updated successfully.",
      activity: patient.activity,
    });
  } catch (error) {
    console.error("Error updating game activity:", error);
    res.status(500).send({
      success: false,
      message: "Error updating game activity.",
      error: error.message,
    });
  }
};

module.exports.getActivity = async (req, res) => {
  try {
    const { patientId } = req.body;

    // Validate input
    if (!patientId) {
      return res.status(400).send({
        success: false,
        message: "Patient ID is required.",
      });
    }

    // Find the patient
    const patient = await patientModel.findById(patientId).populate({
      path: "games",
      select: "name logo", // Include name and logo of the games
    });

    if (!patient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found.",
      });
    }

    // Retrieve the activity data
    const activityData = [];
    for (const [gameId, scores] of patient.activity.entries()) {
      const game = patient.games.find((g) => g._id.toString() === gameId);
      if (game) {
        activityData.push({
          gameId,
          gameName: game.name,
          gameLogo: game.logo,
          scores,
        });
      }
    }

    res.status(200).send({
      success: true,
      message: "Activity data retrieved successfully.",
      activity: activityData,
    });
  } catch (error) {
    console.error("Error retrieving activity data:", error);
    res.status(500).send({
      success: false,
      message: "Error retrieving activity data.",
      error: error.message,
    });
  }
};

module.exports.addMedicine = async (req, res) => {
  try {
    const {
      patientID,
      medicineId,
      startDate,
      endDate,
      mealTime,
      dosage,
      dosageTimes,
    } = req.body;

    // Validate required fields
    if (
      !patientID ||
      !medicineId ||
      !startDate ||
      !endDate ||
      !mealTime ||
      !dosage ||
      !dosageTimes
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required.",
      });
    }

    // Find the patient
    const patient = await patientModel.findById(patientID);
    if (!patient) {
      return res.status(404).send({
        success: false,
        message: "Patient not found.",
      });
    }

    // Find the medicine
    const medicine = await medicineModel.findById(medicineId);
    if (!medicine) {
      return res.status(404).send({
        success: false,
        message: "Medicine not found.",
      });
    }

    // Add the medicine reference with additional details to the patient
    const newMedicineRecord = {
      medicine: medicine._id,
      startDate,
      endDate,
      mealTime,
      dosage,
      dosageTimes,
    };

    patient.medicines.push(newMedicineRecord);

    // Save the updated patient
    await patient.save();

    return res.status(200).send({
      success: true,
      message: "Medicine added successfully.",
      patient,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      success: false,
      message: "Error adding medicine to patient.",
      error: error.message,
    });
  }
};
