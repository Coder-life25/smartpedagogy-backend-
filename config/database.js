const mongoose = require("mongoose");
require("dotenv").config();

const password = process.env.MONGOOSE_PASSWORD;
const mongoURI = `mongodb+srv://prajeetshahlac:${password}@education.safww.mongodb.net/pedagogy?retryWrites=true&w=majority&appName=education`;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);

    console.log(` MongoDB Connected: ${conn.connection.host}`);

    return mongoose.connection; // Return the mongoose connection
  } catch (error) {
    console.error(" MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
