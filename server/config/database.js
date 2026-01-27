const mongoose = require("mongoose");

const connectDB = async (retries = 5, initialDelay = 1000) => {
  let delay = initialDelay;
  let lastError;

  // Safety guard: never allow tests to hit production/Atlas
  if (process.env.NODE_ENV === 'test') {
    const uri = process.env.DB_URI || '';
    const isLocal = uri.startsWith('mongodb://127.0.0.1') || uri.startsWith('mongodb://localhost');
    if (!isLocal) {
      throw new Error('Test environment blocked: DB_URI must point to local MongoDB');
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
      });
      console.log("✅ Connected to MongoDB");
      return; // Success - exit immediately
    } catch (err) {
      lastError = err;
      if (attempt === retries) {
        console.error("❌ Failed to connect to MongoDB after", retries, "attempts");
        console.error("Last error:", err.message);
        process.exit(1);
      }
      const nextDelay = delay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(
        `⚠️  Connection attempt ${attempt}/${retries} failed. Retrying in ${Math.ceil(nextDelay / 1000)}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    }
  }
};

module.exports = connectDB;
