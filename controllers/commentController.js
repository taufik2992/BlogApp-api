const Comment = require("../models/Comment");
const BlogPost = require("../models/BlogPost");

//desc Add a comment to ablog post
//@route POST /api/comments/:postId
//@access Private
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    //ensure blog post exists
    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Page not found" });
    }

    const comment = await Comment.create({
      post: postId,
      content,
      author: req.user._id,
      parentComment: parentComment || null,
    });

    await comment.populate("author", "name profileImageUrl");

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.message });
  }
};

//@desc Get all Comments
//@route GET /api/comments
//@access Public
const getAllComments = async (req, res) => {
  try {
    //Fetch all comment with author populated
    const comments = await Comment.find()
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl")
      .sort({
        createdAt: -1,
      }); // Opsional,so replies come in order

    // create a map for commentId -> comment object
    const commentMap = {};

    comments.forEach((comment) => {
      comment = comment.toObject(); // convert from mongoose document to plain object
      comment.replies = []; // Initialize replies array
      commentMap[comment._id] = comment;
    });

    //Nest replies under their parentComment
    const nestedComments = [];

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
      res.json(nestedComments);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch all comment", error: error.message });
  }
};

//desc Get all comments for a blog posts
//@route GET /api/comments/:postId
//@access Public
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl")
      .sort({ createdAt: -1 }); //optional,so replies come in order

    //create a map for commentId -> comment object
    const commentMap = {};

    comments.forEach((comment) => {
      comment = comment.toObject(); //convert from mongoose document to plain object
      comment.replies = []; //initialize replies array
      commentMap[comment._id] = comment;
    });

    //Nest replies under their parentComment
    const nestedComments = [];

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
      res.json(nestedComments);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to comments", error: error.message });
  }
};

//@desc Delete a comment and its replies(author or admin only)
//@route Delete /api/comments/:commentId
//@access Private
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    //delete the comment
    await Comment.deleteOne({ _id: commentId });

    //delete all replies to this comment(one leve of nesting only)
    await Comment.deleteMany({ parentComment: commentId });

    res
      .status(200)
      .json({ message: "Comment deleted and any replies successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
  deleteComment,
  getAllComments,
};
