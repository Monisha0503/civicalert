const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, "profile_" + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists!" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ message: "Registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, photo: user.photo }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/profile/photo", protect, upload.single("photo"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: req.file.filename },
      { new: true }
    );
    res.json({
      message: "Photo updated!",
      photo: req.file.filename,
      user: { name: user.name, email: user.email, role: user.role, photo: user.photo }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
