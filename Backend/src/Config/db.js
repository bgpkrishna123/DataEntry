require("dotenv").config();
const mongoose = require('mongoose');
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log( error);
  }
};

module.exports = {connectToDB};
