const express = require("express");
const route = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  generateBlogPost,
  generateBlogPostIdeas,
  generateCommentReply,
  generatePostSummary,
} = require("../controllers/aiController");

route.post("/generate", protect, generateBlogPost);
route.post("/generate-ideas", protect, generateBlogPostIdeas);
route.post("/generate-reply", protect, generateCommentReply);
route.post("/generate-summary", generatePostSummary);

module.exports = route;
