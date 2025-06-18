const BlogPost = require("../models/BlogPost");
const Comment = require("../models/Comment");

//@desc Dashboard Summary
//@Route POST /api/dashboard-summary
//@access Private (admin Only)

const getDashboardSummary = async (req, res) => {
  try {
    //basic Counts
    const [totalPosts, dtafts, published, totalComments, aiGenerated] =
      await Promise.all([
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ isDraft: true }),
        BlogPost.countDocuments({ isDraft: false }),
        Comment.countDocuments(),
        BlogPost.countDocuments({ ageneratedAI: true }),
      ]);

    const totalViewsAgg = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikesAgg = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);
    const totalViews = totalViewsAgg[0]?.total || 0;
    const totalLikes = totalLikesAgg[0]?.total || 0;

    //Top Performing posts
    const topPosts = await BlogPost.find({ isDraft: false })
      .select("title coverImageUrl views likes")
      .sort({ views: -1, likes: -1 })
      .limit(5);

    //Recent Comments
    const recentComments = await Comment.find()
      .populate("author", "name profileImageUrl")
      .populate("post", "title coverImageUrl")
      .sort({ createdAt: -1 })
      .limit(5);

    //tag usage aggregation
    const tagUsage = await BlogPost.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      stats: {
        totalPosts,
        dtafts,
        published,
        totalComments,
        aiGenerated,
        totalViews,
        totalLikes,
      },
      topPosts,
      recentComments,
      tagUsage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard Summary",
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummary };
