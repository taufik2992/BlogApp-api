const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByPost,
  deleteComment,
  getAllComments,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/:postId", protect, addComment);
router.get("/:postId", getCommentsByPost);
router.get("/", getAllComments);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
