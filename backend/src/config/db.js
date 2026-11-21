const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const connectDB = async () => {
  try {
    // Load .env from backend/src/.env, backend/.env, or workspace root
    dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
    dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
    dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
    dotenv.config({ path: path.resolve(process.cwd(), 'src/.env'), override: true });

    const mongoURI =
      process.env.MONGO_URI ||
      'mongodb+srv://skrul484_db_user:HGC1dvWgdq2jwl8s@cluster0.braloc4.mongodb.net/school_management';

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
