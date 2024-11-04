const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// DOTENV
dotenv.config();

// DB CONNECTION
connectDB();

// REST Object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ROUTES

app.get("", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MHA Backend!",
  });
});

app.use("/doctor", require("./routes/doctorRoutes"));
app.use("/caretaker", require("./routes/caretakerRoutes"));
app.use("/patient", require("./routes/patientRoutes"));

// PORT
const PORT = process.env.PORT || 8080;

// listen
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`.bgGreen.white);
});
