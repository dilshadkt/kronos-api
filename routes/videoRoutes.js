const express = require("express");
const {
  getVideos,
  getSignaleTutorial,
} = require("../controllers/videoController");
const authenticateToken = require("../middleware/authenticateToken");

// Create Router
const router = express.Router();

router.get("/", authenticateToken, getVideos);
router.get("/signale", authenticateToken, getSignaleTutorial);

module.exports = router;
