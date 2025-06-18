const mongoose = require("mongoose");
const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      default: null, // Bisa diisi URL gambar atau path ke file upload
    },
    tags: {
      type: [{ type: String }],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referensi ke model User
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    generatedByAI: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // createdAt dan updatedAt otomatis
);

module.exports = mongoose.model("BlogPost", BlogPostSchema);
