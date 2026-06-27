import dns from 'dns';
// Force Google DNS to avoid issues with restrictive network DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Attempt reconnection or exit depending on env
    if (process.env.NODE_ENV === 'production') {
      console.error('Production database connection failed. Exiting process...');
      process.exit(1);
    } else {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB event error: ${err.message}`);
  });
};

export default connectDB;
