const gameModel = require("../models/games");
const JWT = require("jsonwebtoken");

developer_email = "test@123";
developer_password = "123";

module.exports.logIn = async (req, res) => {
  try {
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

    if (email == developer_email) {
      if (password == developer_password) {
        //TOKEN JWT
        const token = await JWT.sign(
          { _id: developer_email },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        const user = { name: "developer" };
        return res.status(200).send({
          success: true,
          message: "Login success",
          token,
          user,
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
        message: "Incorrect email",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error in developer LogIn API",
      error: error,
    });
  }
};

module.exports.addGame = async (req, res) => {
  try {
    const { name, logo, html } = req.body;

    // Validate input
    if (!name || !logo || !html) {
      return res.status(400).send({
        success: false,
        message: "All fields (name, logo, html) are required.",
      });
    }

    // Create a new game
    const newGame = new gameModel({ name, logo, html });
    await newGame.save();

    return res.status(201).send({
      success: true,
      message: "Game added successfully.",
      game: newGame,
    });
  } catch (error) {
    console.error("Error adding game:", error);
    return res.status(500).send({
      success: false,
      message: "Error adding game.",
      error: error.message,
    });
  }
};

module.exports.getAllGames = async (req, res) => {
  try {
    // Fetch all games
    const games = await gameModel.find();

    return res.status(200).send({
      success: true,
      message: "Games retrieved successfully.",
      games,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return res.status(500).send({
      success: false,
      message: "Error retrieving games.",
      error: error.message,
    });
  }
};