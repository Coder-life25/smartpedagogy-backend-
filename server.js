const express = require("express");
const connectDB = require("./config/database");
const authRouter = require("./routes/authRoutes");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const profileRouter = require("./routes/profileRoute");
const assignmentRoutes = require("./routes/assignmentRoute");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/api/assignments", assignmentRoutes);

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
