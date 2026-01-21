const express = require("express");
const router = express.Router();
const {
  loginClass,
  registerClass,
  changeClassPassword,
  updateClass,
} = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", loginClass);
router.post("/register", registerClass);
router.post("/change-password", authMiddleware, changeClassPassword);
router.post("/update-class", authMiddleware, updateClass);

module.exports = router;
