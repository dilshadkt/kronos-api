const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  logout,
  forceLogoutAllSessions,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/force-logout", forceLogoutAllSessions);

module.exports = router;
