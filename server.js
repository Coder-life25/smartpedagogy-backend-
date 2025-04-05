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
const classOverviewRoute = require("./routes/classOverviewRoute");
const checkAssignmentRoute = require("./routes/checkAssignmentRoute");
const performanceRoute = require("./routes/performanceRoute");
const feedbackRoute = require("./routes/feedbackRoute");
const teacherFeedbackInsightRoute = require("./routes/teacherFeedbackInsightRoute");

app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "https://smart-pedagogy.vercel.app",
];
//const allowedOrigins = "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("SmartPedagogy Backend is Live 🚀");
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoute);
app.use("/api/class/", classOverviewRoute);
app.use("/api/check/", checkAssignmentRoute);
app.use("/api/performance/", performanceRoute);
app.use("/api/feedback/", feedbackRoute);

app.use("/api/teacher/", teacherFeedbackInsightRoute);

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
