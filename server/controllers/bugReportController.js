const BugReport = require("../models/bugReportSchema");
const mongoose = require("mongoose");

// Create a new bug report
exports.createBugReport = async (req, res) => {
  try {
    const { studentId, email, rollNo, title, description } = req.body;

    if (!email || !rollNo || !title || !description) {
      return res.status(400).json({
        error: "Email, roll number, title, and description are required",
      });
    }

    const bugReportData = {
      email,
      rollNo,
      title,
      description,
    };

    // Add studentId if provided
    if (studentId) {
      bugReportData.studentId = new mongoose.Types.ObjectId(studentId);
    }

    const bugReport = await BugReport.create(bugReportData);

    return res.status(201).json({
      success: true,
      message: "Bug report submitted successfully",
      bugReport,
    });
  } catch (error) {
    console.error("Error creating bug report:", error.message);
    return res.status(500).json({
      error: "Failed to create bug report",
      message: error.message,
    });
  }
};

// Get all bug reports (admin)
exports.getAllBugReports = async (req, res) => {
  try {
    const bugReports = await BugReport.find()
      .populate("studentId", "name email rollNo")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bugReports,
    });
  } catch (error) {
    console.error("Error fetching bug reports:", error.message);
    return res.status(500).json({
      error: "Failed to fetch bug reports",
      message: error.message,
    });
  }
};

// Get bug reports by student
exports.getStudentBugReports = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const bugReports = await BugReport.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bugReports,
    });
  } catch (error) {
    console.error("Error fetching student bug reports:", error.message);
    return res.status(500).json({
      error: "Failed to fetch bug reports",
      message: error.message,
    });
  }
};

// Get a specific bug report
exports.getBugReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const bugReport = await BugReport.findById(id).populate(
      "studentId",
      "name email rollNo"
    );

    if (!bugReport) {
      return res.status(404).json({ error: "Bug report not found" });
    }

    return res.status(200).json({
      success: true,
      bugReport,
    });
  } catch (error) {
    console.error("Error fetching bug report:", error.message);
    return res.status(500).json({
      error: "Failed to fetch bug report",
      message: error.message,
    });
  }
};

// Update bug report status (admin)
exports.updateBugReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Bug report ID is required" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;
    updateData.updatedAt = Date.now();

    const bugReport = await BugReport.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!bugReport) {
      return res.status(404).json({ error: "Bug report not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bug report updated successfully",
      bugReport,
    });
  } catch (error) {
    console.error("Error updating bug report:", error.message);
    return res.status(500).json({
      error: "Failed to update bug report",
      message: error.message,
    });
  }
};

// Delete a bug report (admin)
exports.deleteBugReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Bug report ID is required" });
    }

    const bugReport = await BugReport.findByIdAndDelete(id);

    if (!bugReport) {
      return res.status(404).json({ error: "Bug report not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bug report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bug report:", error.message);
    return res.status(500).json({
      error: "Failed to delete bug report",
      message: error.message,
    });
  }
};
