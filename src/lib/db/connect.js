import mongoose from 'mongoose';

let isConnected = false; // Track the connection status

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Could not connect to MongoDB');
  }
};