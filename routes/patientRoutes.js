const express = require("express");
const patientControllers = require("../controllers/patientControllers");

// router object
const router = express.Router();

// routes
router.post("/login", patientControllers.logIn);
router.post("/updateDeviceToken", patientControllers.updateDeviceToken);
router.post("/addMedicine", patientControllers.addMedicine);
router.post("/deleteMedicine", patientControllers.deleteMedicine);
router.post("/getMedicines", patientControllers.getMedicine);
router.post("/addGame", patientControllers.addGame);
router.post("/deleteGame", patientControllers.deleteGame);
router.post("/getGames", patientControllers.getGames);
router.put("/updateGameActivity", patientControllers.updateGameActivity);
router.post("/getActivity", patientControllers.getActivity);
router.post("/removeDeviceToken", patientControllers.removeDeviceToken);

// export
module.exports = router;
