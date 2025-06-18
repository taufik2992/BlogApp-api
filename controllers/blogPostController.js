const BlogPost = require("../models/BlogPost");
const mongoose = require("mongoose");

//@desc Create a new blog Post
//@route POST /api/posts
//@access Private (admin Only)
const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, isDraft, generatedByAI } =
      req.body;
    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const newPost = new BlogPost({
      title,
      slug,
      content,
      coverImageUrl,
      tags,
      author: req.user._id,
      isDraft,
      generatedByAI,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc Update an existing blog posts
//@route PUT /api/posts/:id
//@access Private (author or admin)
const updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (
      post.author.toString() !== req.user._id.toString() &&
      !req.user.role.isAdmin
    ) {
      return res
        .status(401)
        .json({ message: "Not Authorized to update this post" });
    }
    const updatedData = req.body;
    if (updatedData.title) {
      updatedData.slug = updatedData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc Delete a blog post
//@route DELETE /api/posts/:id
//@access Private (admin only)
const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc  get blog posts by status (all,publish,or draft) and iclude counts
//@route GET /api/posts?status=published|draft|all&pahe=1
// GET http://localhost:8000/api/posts?status=published&page=1
//@access Public
const getAllPosts = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    //Determine filter for main posst respone
    let filter = {};
    if (status === "publish") filter.isDraft = false;
    if (status === "draft") filter.isDraft = true;

    // Fetch Paginated posts
    const posts = await BlogPost.find(filter)
      .populate("author", "name profileImageUrl")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    //Count total posts for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount] =
      await Promise.all([
        BlogPost.countDocuments(filter),
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ isDraft: false }),
        BlogPost.countDocuments({ isDraft: true }),
      ]);
    res.json({
      posts,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc  GET single blog post by slug
//@route GET /api/posts/:slug
//@access Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
    }).populate("author", "name profileImageUrl bio role createdAt updatedAt");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc  GET posts bu tag
//@route GET /api/posts/tag/:tag
//@access Public
const getPostsByTag = async (req, res) => {
  try {
    const posts = await BlogPost.find({
      tags: req.params.tag,
      isDraft: false,
    }).populate("author", "name profileImageUrl");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc  Search Posts by title or content
//@route GET /api/posts/search?q=keyword
//@access Public
const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await BlogPost.find({
      isDraft: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    }).populate("author", "name profileImageUrl");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc Increment post view Count
//@route PUT /api/posts/:id/view
//@access Public
const incrementView = async (req, res) => {
  try {
    await BlogPost.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json({ message: "View count incremented successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc Like a post
//@route PUT /api/posts/:id/like
//@access Public
const likePost = async (req, res) => {
  try {
    await BlogPost.findByIdAndUpdate(req.params.id, {
      $inc: { likes: 1 },
    });
    res.status(200).json({ message: "Like count incremented successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc Get top trending posts
//@route GET /api/posts/trending
//@access Private
const getTopPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isDraft: false })
      .sort({ likes: -1, views: -1 })
      .limit(5);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
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
};
