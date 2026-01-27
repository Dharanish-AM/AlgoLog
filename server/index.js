const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const path = require("path");

dotenv.config();

const connectDB = require("./config/database");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const authRoutes = require("./routes/authRoutes");
const bugReportRoutes = require("./routes/bugReportRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// Trust first proxy (required for proxies like Render, Heroku, etc.)
app.set('trust proxy', 1);

app.use(
  cors({
    origin: "*", 
  })
);
app.use(helmet());
app.use(express.json());

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/student", studentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/class", classRoutes);
app.use("/api", authRoutes);
app.use("/api/bug-reports", bugReportRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
