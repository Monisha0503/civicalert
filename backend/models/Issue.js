const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["pothole", "streetlight", "garbage", "waterleak", "other"],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["open", "inprogress", "resolved"],
    default: "open"
  },
  upvotes: {
    type: Number,
    default: 0
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);
