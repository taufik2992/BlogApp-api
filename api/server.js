require("dotenv").config();
const serverless = require("serverless-http");
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

// Export as Vercel serverless handler
module.exports = app;
module.exports.handler = serverless(app);
