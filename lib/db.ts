import mongoose from "mongoose";

export const connectDb = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(process.env.MONGO_URI as string, {});
};
