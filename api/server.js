require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("../config/db");

const authRoutes = require("../routes/authRoutes");
const blogPostRoutes = require("../routes/blogPostRoutes");
const commentRoutes = require("../routes/commentRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const aiRoutes = require("../routes/aiRoutes");

const app = express();

//middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Connet Database
connectDB();

//middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogPostRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard-summary", dashboardRoutes);
app.use("/api/ai", aiRoutes);

//serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {}));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
