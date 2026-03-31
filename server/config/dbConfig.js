const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);

    // Retry after 5 seconds instead of crashing
    setTimeout(connectDB, 5000);
  }
};

connectDB();

module.exports = mongoose;
