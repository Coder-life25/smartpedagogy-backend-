const express = require("express");
const connectDB = require("./config/database");
const authRouter = require("./routes/authRoutes");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);

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
