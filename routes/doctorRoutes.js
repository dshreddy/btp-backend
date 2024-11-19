const express = require("express");
const doctorControllers = require("../controllers/doctorControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", doctorControllers.signUp);
router.post("/login", doctorControllers.logIn);
router.put("/update", doctorControllers.update);
router.put("/addMedicine", doctorControllers.addMedicine);
router.put("/addPatient", doctorControllers.addPatient);
router.post("/getPatients", doctorControllers.getPatients);

// export
module.exports = router;
