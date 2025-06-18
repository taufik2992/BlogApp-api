const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama harus diisi"],
      trim: true, // Menghapus spasi di awal dan akhir
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true, // Email harus unik
      trim: true,
      lowercase: true, // Simpan email dalam lowercase
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email tidak valid",
      ], // Validasi format email
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      minlength: [6, "Password minimal 6 karakter"],
    },
    profileImageUrl: {
      type: String,
      default: "", // Default kosong atau bisa diisi URL gambar default
    },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio maksimal 500 karakter"],
    },
    role: {
      type: String,
      enum: ["member", "admin"], // Hanya boleh "user" atau "admin"
      default: "member",
    },
  },
  { timestamps: true } // Tambahkan createdAt dan updatedAt otomatis
);

module.exports = mongoose.model("User", UserSchema);
