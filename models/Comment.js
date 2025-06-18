const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogPost", // Referensi ke model BlogPost
      required: [true, "Komentar harus terkait dengan artikel"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referensi ke model User
      required: [true, "Penulis komentar harus diisi"],
    },
    content: {
      type: String,
      required: [true, "Konten komentar tidak boleh kosong"],
      trim: true,
      maxlength: [1000, "Komentar tidak boleh lebih dari 1000 karakter"],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Referensi ke komentar induk (untuk nested comments)
      default: null, // Null jika komentar utama
    },
  },
  { timestamps: true } // createdAt dan updatedAt otomatis
);

module.exports = mongoose.model("Comment", CommentSchema);
