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

// Department routes
router.post("/department/login", loginDepartment);
router.get("/departments", getAllDepartments);
router.post("/department/create", createDepartment);

// Shared routes
router.get("/get-form-details", getFormDetails);
router.get("/get-daily-leetcode-problem", getDailyLeetCodeProblem);

// Auth routes (token validation can be moved to middleware)
router.post("/check-token", (req, res) => {
  try {
    const jwt = require("jsonwebtoken");
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(200).json({ message: "Token is valid" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/get-user", (req, res) => {
  try {
    const jwt = require("jsonwebtoken");
    const Department = require("../models/departmentSchema");
    const Admin = require("../models/adminSchema");
    const Class = require("../models/classSchema");

    const token = req.body?.token;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    Promise.all([
      Department.findById(decoded.id)
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
      Admin.findById(decoded.id),
      Class.findById(decoded.id).populate("department"),
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

// Admin routes
router.post("/admin/create", createAdmin);
router.post("/admin/login", loginAdmin);
router.get("/admin/get-admin", getAdmin);
router.get("/admin/get-departments", getAdminDepartments);
router.get("/admin/get-classes", getAdminClasses);

// LeetCode contests
router.get("/contests/all", async (req, res) => {
  try {
    const axios = require("axios");
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
          isVirtual
        }
      }
    `;
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ contests: response.data.data.allContests });
  } catch (err) {
    console.error("Error fetching contests:", err);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

module.exports = router;
