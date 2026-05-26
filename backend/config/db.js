const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n⚠️  LOCAL DATABASE NOT RUNNING!');
    console.error('To run the database locally, please ensure MongoDB is running (e.g. start "MongoDB" service in Windows Services).');
    console.error('For final interview grading, set your Atlas connection string in backend/.env.');
    console.error(`Error Details: ${error.message}\n`);
    // Do not call process.exit(1) to let Express serve static diagnostic pages
  }
};

module.exports = connectDB;
