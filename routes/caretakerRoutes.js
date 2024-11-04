const express = require("express");
const caretakerControllers = require("../controllers/caretakerControllers");

// router object
const router = express.Router();

// routes
router.post("/signup", caretakerControllers.signUp);
router.post("/login", caretakerControllers.logIn);

// export
module.exports = router;
