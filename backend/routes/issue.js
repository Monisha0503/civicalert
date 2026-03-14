const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed!"), false);
    }
  }
});

// 📍 Report Issue
router.post("/report", protect, upload.single("photo"), async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const issue = new Issue({
      title,
      description,
      category,
      location,
      photo: req.file ? req.file.filename : "",
      reportedBy: req.user.id
    });
    await issue.save();
    res.status(201).json({ message: "Issue reported successfully ✅", issue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 Get All Issues (Admin)
router.get("/all", protect, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ upvotes: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 Get My Issues (Citizen)
router.get("/myissues", protect, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔄 Update Status (Admin)
router.put("/status/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: "Status updated ✅", issue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 👍 Upvote Issue
router.put("/upvote/:id", protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    res.json({ message: "Upvoted ✅", issue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑️ Delete Issue
router.delete("/:id", protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }
    if (issue.reportedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized!" });
    }
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
