const express = require("express");
const patientControllers = require("../controllers/patientControllers");

// router object
const router = express.Router();

// routes
router.post("/login", patientControllers.logIn);
router.post("/addMedicine", patientControllers.addMedicine);
router.post("/getMedicines", patientControllers.getMedicine);
router.post("/getGames", patientControllers.getGames);

// export
module.exports = router;
