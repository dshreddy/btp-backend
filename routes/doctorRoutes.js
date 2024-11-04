const express = require("express");
const doctorControllers = require("../controllers/doctorControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", doctorControllers.signUp);
router.post("/login", doctorControllers.logIn);

// export
module.exports = router;
