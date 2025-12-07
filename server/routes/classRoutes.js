const express = require("express");
const router = express.Router();
const {
  loginClass,
  registerClass,
  changeClassPassword,
  updateClass,
} = require("../controllers/classController");

router.post("/login", loginClass);
router.post("/register", registerClass);
router.post("/change-password", changeClassPassword);
router.post("/update-class", updateClass);

module.exports = router;
