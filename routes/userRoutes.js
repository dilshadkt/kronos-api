const express = require("express");

const authenticateToken = require("../middleware/authenticateToken");
const {
  getUser,
  deleteUser,
  updateUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", authenticateToken, getUser);
router.delete("/:userId", authenticateToken, deleteUser);
router.patch("/:userId", authenticateToken, updateUser);

module.exports = router;
