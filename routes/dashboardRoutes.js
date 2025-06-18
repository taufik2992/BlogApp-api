const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");
//admin-only Middleware

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin Access Only" });
  }
};

//Dashboard Routes
router.get("/", protect, adminOnly, getDashboardSummary);

module.exports = router;
