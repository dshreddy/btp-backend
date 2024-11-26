const express = require("express");
const developerControllers = require("../controllers/developerControllers");

// router object
const router = express.Router();

// routes
router.post("/login", developerControllers.logIn);
router.post("/addGame", developerControllers.addGame);
router.post("/updateGame", developerControllers.updateGame);
router.post("/deleteGame", developerControllers.deleteGame);
router.post("/getAllGames", developerControllers.getAllGames);

// export
module.exports = router;
