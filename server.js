const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const authRouter = require("./routes/authRoutes");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const profileRouter = require("./routes/profileRoute");
const assignmentRoutes = require("./routes/assignmentRoute");
const submissionRoute = require("./routes/submissionRoute");

app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoute);

connectDB()
  .then(() => {
    console.log("Database connected Successfully");
    app.listen(5555, () => {
      console.log("server is listening at port 5555");
    });
  })
  .catch((err) => {
    console.log("Database not connected");
  });
