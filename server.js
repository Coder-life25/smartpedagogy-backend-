const express = require("express");
const connectDB = require("./config/database");
const app = express();

app.use("/", (req, res) => {
  res.send("hello world");
});

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
