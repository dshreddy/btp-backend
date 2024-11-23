const express = require("express");
const patientControllers = require("../controllers/patientControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", patientControllers.signUp);
router.post("/login", patientControllers.logIn);
router.post("/updateDeviceToken", patientControllers.updateDeviceToken);

// export
module.exports = router;
