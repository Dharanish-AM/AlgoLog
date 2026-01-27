const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const bugReportController = require("../controllers/bugReportController");

// Create a new bug report (public - no auth required)
router.post("/", bugReportController.createBugReport);

// Get all bug reports (admin)
router.get("/admin/all", authMiddleware, bugReportController.getAllBugReports);

// Get bug reports by student
router.get("/student/:studentId", authMiddleware, bugReportController.getStudentBugReports);

// Get a specific bug report
router.get("/:id", authMiddleware, bugReportController.getBugReportById);

// Update bug report status (admin)
router.put("/:id", authMiddleware, bugReportController.updateBugReportStatus);

// Delete a bug report (admin)
router.delete("/:id", authMiddleware, bugReportController.deleteBugReport);

module.exports = router;
