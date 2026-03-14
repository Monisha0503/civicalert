const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issue");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/api/test", (req, res) => res.json({ status: "ok", mongo: mongoose.connection.readyState }));

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://monishagnanaprakasam4_db_user:Civic2024!@cluster0.zoj9zfb.mongodb.net/civicalert?appName=Cluster0";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/test
