const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const {
  addAffiliate,
  getAfiliates,
  getAfilitate,
  deleteAffiliate,
  updateAffiliate,
} = require("../controllers/affiliatesController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post(
  "/add",
  authenticateToken,
  upload.single("profileImage"),
  addAffiliate
);
router.get("/", authenticateToken, getAfiliates);
router.get("/:id", authenticateToken, getAfilitate);
router.delete("/:id", authenticateToken, deleteAffiliate);
router.patch(
  "/:id",
  authenticateToken,
  upload.single("profileImage"),
  updateAffiliate
);

module.exports = router;
