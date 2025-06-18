const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  searchPosts,
  incrementView,
  likePost,
  getTopPosts,
} = require("../controllers/blogPostController");

const { protect } = require("../middlewares/authMiddleware");

//Admin-Only Middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Admin Access Only" });
  }
};

router.post("/", protect, adminOnly, createPost);
router.get("/", getAllPosts);
router.get("/slug/:slug", getPostBySlug);
router.put("/:id", protect, adminOnly, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);
router.get("/tag/:tag", getPostsByTag);
router.get("/search", searchPosts);
router.put("/:id/view", protect, incrementView);
router.put("/:id/like", protect, likePost);
router.get("/trending", getTopPosts);

module.exports = router;
