const express = require("express");
const { getVideos } = require("../controllers/videoController");
const authenticateToken = require("../middleware/authenticateToken");

// Create Router
const router = express.Router();

router.get("/", authenticateToken, getVideos);

module.exports = router;
