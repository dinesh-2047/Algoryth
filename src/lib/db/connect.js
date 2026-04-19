import mongoose from "mongoose";

const globalMongoose = globalThis;

if (!globalMongoose.__algorythMongoose) {
  globalMongoose.__algorythMongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (globalMongoose.__algorythMongoose.conn) {
    return globalMongoose.__algorythMongoose.conn;
  }

  if (!globalMongoose.__algorythMongoose.promise) {
    globalMongoose.__algorythMongoose.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    globalMongoose.__algorythMongoose.conn = await globalMongoose.__algorythMongoose.promise;
    return globalMongoose.__algorythMongoose.conn;
  } catch (error) {
    globalMongoose.__algorythMongoose.promise = null;
    throw new Error(`Could not connect to MongoDB: ${error.message}`);
  }
};