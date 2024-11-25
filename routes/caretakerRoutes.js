const express = require("express");
const caretakerControllers = require("../controllers/caretakerControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", caretakerControllers.signUp);
router.post("/login", caretakerControllers.logIn);
router.put("/update", caretakerControllers.update);
router.post("/getPatients", caretakerControllers.getPatients);
router.post("/notifyPatient", caretakerControllers.notifyPatient);

// export
module.exports = router;
