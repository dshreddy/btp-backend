const express = require("express");
const doctorControllers = require("../controllers/doctorControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", doctorControllers.signUp);
router.post("/login", doctorControllers.logIn);
router.put("/update", doctorControllers.update);
router.put("/addPatient", doctorControllers.update);

// export
module.exports = router;
