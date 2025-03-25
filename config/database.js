const mongoose = require("mongoose");
require("dotenv").config();
const password = process.env.MONGOOSE_PASSWORD;
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://prajeetshahlac:" +
      password +
      "@education.safww.mongodb.net/pedagogy?retryWrites=true&w=majority&appName=education"
  );
};

module.exports = connectDB;
