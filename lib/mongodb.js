import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("❌ MONGODB_URL is not defined in .env.local");
}

export const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
console.log("MONGODB_URL =", process.env.MONGODB_URL);

  try {
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
    throw error;
  }
};
