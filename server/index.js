const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import configuration
const connectDB = require("./config/database");



// Import routes
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const authRoutes = require("./routes/authRoutes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount routes with /api prefix
app.use("/api/students", studentRoutes);  // For GET /api/students (list)
app.use("/api/student", studentRoutes);   // For POST /api/student/login, GET /api/student/get-student
app.use("/api/class", classRoutes);
app.use("/api", authRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
