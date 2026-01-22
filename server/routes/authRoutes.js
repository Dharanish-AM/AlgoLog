const express = require("express");
const router = express.Router();
const {
  loginDepartment,
  getAllDepartments,
  createDepartment,
  getFormDetails,
  getDailyLeetCodeProblem,
  createAdmin,
  loginAdmin,
  getAdmin,
  getAdminDepartments,
  getAdminClasses,
} = require("../controllers/authController");
const {
  getAllContests,
  refetchContests,
  getContestStats,
} = require("../controllers/contestController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/department/login", loginDepartment);
router.get("/departments", getAllDepartments);
router.post("/department/create", createDepartment);

router.get("/get-form-details", getFormDetails);
router.get("/get-daily-leetcode-problem", getDailyLeetCodeProblem);

router.post("/check-token", authMiddleware, (req, res) => {
  return res.status(200).json({ message: "Token is valid", user: req.user });
});

router.post("/get-user", authMiddleware, (req, res) => {
  try {
    const Department = require("../models/departmentSchema");
    const Admin = require("../models/adminSchema");
    const Class = require("../models/classSchema");

    Promise.all([
      Department.findById(req.user.id)
        .select("+password")
        .populate({
          path: "classes",
          populate: {
            path: "students",
            model: "Student",
            populate: {
              path: "department",
              select: "-password -classes",
            },
          },
        }),
      Admin.findById(req.user.id),
      Class.findById(req.user.id).populate("department"),
    ])
      .then(([departmentData, admin, classData]) => {
        if (departmentData) {
          return res
            .status(200)
            .json({ user: departmentData, role: "department" });
        }

        if (admin) {
          const { password, ...adminWithoutPassword } = admin.toObject();
          return res
            .status(200)
            .json({ user: adminWithoutPassword, role: "admin" });
        }

        if (classData) {
          const { password, ...classWithoutPassword } = classData.toObject();
          return res
            .status(200)
            .json({ user: classWithoutPassword, role: "class" });
        }

        return res.status(404).json({ message: "User not found" });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Failed to fetch user" });
      });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.post("/admin/create", createAdmin);
router.post("/admin/login", loginAdmin);
router.get("/admin/get-admin", authMiddleware, getAdmin);
router.get("/admin/get-departments", getAdminDepartments);
router.get("/admin/get-classes", authMiddleware, getAdminClasses);

router.get("/contests/all", authMiddleware, getAllContests);
router.get("/contests/refetch", authMiddleware, refetchContests);
router.get("/contests/stats", authMiddleware, getContestStats);

module.exports = router;
