const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexora_db', {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[NEXORA DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[NEXORA DB] MongoDB local daemon connection failed: ${error.message}`);
    console.warn(`[NEXORA DB] Running in hybrid resilient mode with local memory fallback store.`);
    isConnected = false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
