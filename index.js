const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
require("./utils/medicineReminderCron");

// DOTENV
dotenv.config();

// DB CONNECTION
connectDB();

// REST Object
const app = express();

// middlewares
app.use(
  bodyParser.json({
    limit: "10mb", // Increase the limit to 10MB or a size appropriate for your use case
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "10mb", // Increase the limit for URL-encoded data
    extended: true,
  })
);
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
app.use("/developer", require("./routes/developerRoutes"));

// PORT
const PORT = process.env.PORT || 8080;

// listen
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`.bgGreen.white);
});
