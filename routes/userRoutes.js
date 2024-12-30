const express = require("express");

const authenticateToken = require("../middleware/authenticateToken");
const { getUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.get("/", authenticateToken, getUser);
router.delete("/:userId", authenticateToken, deleteUser);

module.exports = router;
