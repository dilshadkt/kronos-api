require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const afiliatesRoutes = require("./routes/afiliatesRotes");
const videoRoutes = require("./routes/videoRoutes");
const app = express();
const { cloudinaryConfig } = require("./config/Cloudinary");
const { checkSessionStatus } = require("./controllers/authController");

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://kronoslimited.com",
      "https://www.kronoslimited.com",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use("*", cloudinaryConfig);

// Database Connection
connectDB();

// Routes
app.use(checkSessionStatus);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/afiliates", afiliatesRoutes);
app.use("/api/videos", videoRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
