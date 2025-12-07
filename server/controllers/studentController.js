const Student = require("../models/studentSchema");
const Class = require("../models/classSchema");
const Department = require("../models/departmentSchema");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { getStatsForStudent } = require("../utils/helpers");
const BatchProcessor = require("../utils/batchProcessor");
const DataValidator = require("../utils/dataValidator");

// Get students by class ID
exports.getStudentsByClass = async (req, res) => {
  try {
    const classId = req.query.classId;
    const students = await Student.find({
      classId,
    })
      .lean()
      .populate("department");
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const results = students.map((student) => {
      const { stats, ...studentWithoutStats } = student;
      return { ...studentWithoutStats, stats };
    });

    res.status(200).json({
      students: results,
    });
  } catch (error) {
    console.error("Error fetching students and stats:", error);
    res.status(500).json({ error: "Failed to fetch students and stats" });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({})
      .lean()
      .select("-password")
      .populate("department", "-password -classes");
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const results = students.map((student) => {
      const { stats, ...studentWithoutStats } = student;
      return { ...studentWithoutStats, stats };
    });

    res.status(200).json({
      students: results,
    });
  } catch (error) {
    console.error("Error fetching students and stats:", error);
    res.status(500).json({ error: "Failed to fetch students and stats" });
  }
};

// Create new student
exports.addStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      rollNo,
      year,
      department,
      section,
      leetcode,
      hackerrank,
      codechef,
      codeforces,
      skillrack,
      github,
    } = req.body;

    if (!name || !email || !rollNo) {
      return res
        .status(400)
        .json({ error: "Name, email, and roll number are required" });
    }

    // Validate department
    const departmentData = await Department.findById(department);
    if (!departmentData) {
      return res.status(404).json({
        error: "Department not found. Cannot proceed with class lookup.",
      });
    }

    // Find class
    const classData = await Class.findOne({
      section,
      year,
      department: departmentData._id,
    });

    if (!classData) {
      return res.status(404).json({
        error: "Class not found for the given section/year/department.",
      });
    }

    // Hash password
    const password = "sece@123";
    const hashPass = await bcrypt.hash(password, 10);

    // Prepare student object
    const studentInfo = {
      name,
      email,
      rollNo,
      year,
      department: departmentData._id,
      section,
      leetcode,
      hackerrank,
      codechef,
      codeforces,
      skillrack,
      github,
      classId: classData._id,
      password: hashPass,
    };

    // Fetch stats
    let statsResult = { stats: {} };
    try {
      statsResult = await getStatsForStudent(studentInfo, studentInfo.stats);
    } catch (err) {
      console.warn("Stats fetch failed, proceeding with empty stats:", err);
    }

    // Save student
    const newStudent = new Student({
      ...studentInfo,
      stats: statsResult.stats,
    });

    const savedStudent = await newStudent.save();

    // Add student to class
    await Class.findByIdAndUpdate(classData._id, {
      $addToSet: { students: savedStudent._id },
    });

    return res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).json({ error: "Failed to add student" });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      rollNo,
      year,
      department,
      section,
      leetcode,
      hackerrank,
      codechef,
      codeforces,
      skillrack,
      github,
    } = req.body;

    console.log(`🛠️ Updating student:`, req.body);

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const departmentId =
      typeof department === "string" ? department : department?._id;

    if (!departmentId) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const departmentData = await Department.findById(departmentId);
    if (!departmentData) {
      return res.status(404).json({ error: "Department not found" });
    }

    const classData = await Class.findOne({
      section,
      year,
      department: departmentData._id,
    });

    if (!classData) {
      return res.status(404).json({
        error: "Class not found for given section, year, and department",
      });
    }

    const updatedData = {
      name,
      email,
      rollNo,
      year,
      department: departmentData._id,
      section,
      leetcode,
      hackerrank,
      codechef,
      codeforces,
      skillrack,
      github,
      classId: classData._id,
    };

    // Update stats
    const updatedStats = await getStatsForStudent(
      { _id: existingStudent._id, ...updatedData },
      existingStudent.stats || {}
    );

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats: updatedStats?.stats || existingStudent.stats,
      },
      { new: true }
    ).populate("department");

    // Update class arrays if class changed
    if (existingStudent.classId?.toString() !== classData._id.toString()) {
      if (existingStudent.classId) {
        await Class.findByIdAndUpdate(existingStudent.classId, {
          $pull: { students: existingStudent._id },
        });
      }

      await Class.findByIdAndUpdate(classData._id, {
        $addToSet: { students: existingStudent._id },
      });
    }

    console.log(`✅ Student updated: ${updatedStudent.name}`);
    res.status(200).json({ student: updatedStudent });
  } catch (error) {
    console.error("🔥 Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classId = student.classId;

    await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: id } },
      { new: true }
    );

    await Student.findByIdAndDelete(id);

    res.json({
      message: "Student deleted and removed from class successfully",
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

// Refetch stats for a single student
exports.refetchSingleStudent = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.query;

  try {
    if (!id) {
      console.warn("[WARN] Student ID missing in query.");
      return res.status(400).json({ error: "Student ID is required" });
    }

    console.log(`\n[INFO] Refetching stats for student ID: ${id}`);

    const student = await Student.findById(id);
    if (!student) {
      console.warn(`[WARN] Student not found: ${id}`);
      return res.status(404).json({ error: "Student not found" });
    }

    console.log(`[INFO] Student: ${student.name} (${student.rollNo})`);

    const validator = new DataValidator();
    const updatedStats = await getStatsForStudent(student, student.stats);
    const { stats } = updatedStats;

    const validation = validator.validateAll(stats);

    console.log(`[VALIDATION] Overall valid: ${validation.valid}`);
    if (!validation.valid) {
      console.warn(`[VALIDATION] Errors:`, validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn(`[VALIDATION] Warnings:`, validation.warnings);
    }

    const anomalies = {};
    for (const platform of Object.keys(stats)) {
      const platformAnomalies = validator.detectAnomalies(
        student.stats?.[platform],
        stats[platform],
        platform
      );
      if (platformAnomalies.length > 0) {
        anomalies[platform] = platformAnomalies;
        console.warn(`[ANOMALY] ${platform}:`, platformAnomalies);
      }
    }

    const failedPlatforms = [];
    const platformChecks = {
      leetcode: () => student.leetcode && !stats.leetcode?.solved?.All,
      hackerrank: () =>
        student.hackerrank &&
        (!Array.isArray(stats.hackerrank?.badges) ||
          stats.hackerrank.badges.length === 0),
      codechef: () => student.codechef && !stats.codechef?.fullySolved,
      github: () =>
        student.github &&
        (typeof stats.github !== "object" || stats.github.totalCommits == null),
      codeforces: () =>
        student.codeforces &&
        !stats.codeforces?.contests &&
        !stats.codeforces?.problemsSolved,
      skillrack: () =>
        student.skillrack &&
        (!stats.skillrack?.programsSolved || stats.skillrack.programsSolved < 1),
    };

    for (const [platform, checkFn] of Object.entries(platformChecks)) {
      if (checkFn()) {
        failedPlatforms.push(platform);
      }
    }

    if (failedPlatforms.length > 0) {
      console.warn(
        `[WARN] Incomplete stats for ${student.name}: ${failedPlatforms.join(
          ", "
        )}`
      );
    } else {
      console.log(`[SUCCESS] All stats valid for ${student.name}`);
    }

    const mergedStats = { ...student.stats };
    for (const [platform, platformStats] of Object.entries(stats)) {
      if (!platformStats.error) {
        mergedStats[platform] = platformStats;
      } else {
        console.warn(
          `[WARN] Keeping old ${platform} stats due to error: ${platformStats.error}`
        );
      }
    }

    await Student.findByIdAndUpdate(
      id,
      {
        stats: mergedStats,
        updatedAt: new Date(),
      },
      { new: true }
    );

    const newStudentData = await Student.findById(id).populate("department");

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);

    const avgScore =
      Object.values(validation.platforms).reduce(
        (sum, p) => sum + (p.score || 0),
        0
      ) / Object.keys(validation.platforms).length;

    console.log(
      `[TIMER] Refetch for ${student.name} completed in ${durationMs}ms (~${durationSec}s)`
    );
    console.log(`[QUALITY] Validation score: ${avgScore.toFixed(1)}%`);

    return res.status(200).json({
      success: true,
      student: newStudentData,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        score: avgScore,
        platforms: validation.platforms,
      },
      anomalies,
      failedPlatforms,
      performance: {
        duration: durationMs,
        durationSec: parseFloat(durationSec),
      },
      updatedAt: new Date(),
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(
      `[ERROR] Failed to refetch student stats after ${durationMs}ms:`,
      error.message
    );
    res.status(500).json({
      success: false,
      error: "Failed to refetch student stats",
      message: error.message,
      duration: durationMs,
    });
  }
};

// Refetch stats for a class
exports.refetchClassStudents = async (req, res) => {
  const start = Date.now();
  const now = new Date();

  try {
    const { classId } = req.query;

    console.log(
      `\n🚀 Starting OPTIMIZED stats refetch for Class ID: ${classId} at ${now.toLocaleString()}`
    );

    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" });
    }

    const students = await Student.find({ classId });
    if (!students || students.length === 0) {
      console.warn("⚠️ No students found for class:", classId);
      return res.status(200).json({ students: [], count: 0 });
    }

    const validator = new DataValidator();
    const processor = new BatchProcessor({
      concurrency: 3,
      batchSize: 10,
      retryAttempts: 1,
      timeout: 45000,
    });

    let progressUpdate = null;

    processor.onProgress((stats) => {
      progressUpdate = stats;
      console.log(
        `📊 Progress: ${stats.processed}/${stats.total} (${stats.percentage.toFixed(1)}%) - ` +
          `✅ ${stats.succeeded} succeeded, ❌ ${stats.failed} failed, ⏭️  ${stats.skipped} skipped`
      );
    });

    processor.onBatchComplete((info) => {
      console.log(
        `✨ Batch ${info.batchIndex + 1}/${info.totalBatches} done - ` +
          `${info.batchSize} students in ${(info.duration / 1000).toFixed(2)}s`
      );
    });

    const dataQualityUpdates = [];
    const updatePromises = [];

    const { results, stats, errors } = await processor.processBatch(
      students,
      async (student, index) => {
        console.log(
          `\n🔄 [${index + 1}/${students.length}] Processing ${student.name} (${student.rollNo})`
        );

        try {
          const updatedStats = await getStatsForStudent(student, student.stats);
          const validation = validator.validateAll(updatedStats.stats);

          if (!validation.valid) {
            console.warn(`⚠️  Validation issues for ${student.name}:`, validation.errors);
          }

          if (validation.warnings.length > 0) {
            console.warn(`⚡ Warnings for ${student.name}:`, validation.warnings);
          }

          const anomalies = {};
          for (const platform of Object.keys(updatedStats.stats)) {
            const platformAnomalies = validator.detectAnomalies(
              student.stats?.[platform],
              updatedStats.stats[platform],
              platform
            );
            if (platformAnomalies.length > 0) {
              anomalies[platform] = platformAnomalies;
              console.warn(
                `🔍 Anomalies detected for ${student.name} on ${platform}:`,
                platformAnomalies
              );
            }
          }

          const mergedStats = { ...student.stats };
          let platformsUpdated = 0;
          for (const [platform, platformStats] of Object.entries(
            updatedStats.stats
          )) {
            if (!platformStats.error) {
              mergedStats[platform] = platformStats;
              platformsUpdated++;
            } else {
              console.warn(
                `⚠️  Keeping old ${platform} stats for ${student.name} due to error`
              );
            }
          }

          const avgValidationScore =
            Object.values(validation.platforms).reduce(
              (sum, p) => sum + (p.score || 0),
              0
            ) / Object.keys(validation.platforms).length;

          const updatePromise = Student.findByIdAndUpdate(student._id, {
            $set: {
              stats: mergedStats,
              updatedAt: now,
              dataQuality: {
                score: avgValidationScore,
                lastValidation: now,
                platformsUpdated,
                hasAnomalies: Object.keys(anomalies).length > 0,
              },
            },
            $push: {
              statsHistory: {
                $each: [
                  {
                    timestamp: now,
                    stats: mergedStats,
                    validationScore: avgValidationScore,
                    anomalies: Object.keys(anomalies).length > 0 ? anomalies : undefined,
                  },
                ],
                $slice: -10,
              },
            },
          });

          updatePromises.push(updatePromise);

          console.log(
            `✅ Prepared update for ${student.name} - Validation score: ${avgValidationScore.toFixed(1)}%`
          );

          return {
            student: student.name,
            rollNo: student.rollNo,
            validation,
            anomalies,
          };
        } catch (error) {
          console.error(`❌ Failed to process ${student.name}: ${error.message}`);
          throw error;
        }
      }
    );

    await Class.findByIdAndUpdate(classId, {
      studentsUpdatedAt: now,
    });

    const duration = Date.now() - start;

    const failedStudents = errors.map((e) => ({
      name: e.item.name,
      rollNo: e.item.rollNo,
      error: e.error,
    }));

    const successfulResults = results.filter((r) => r.success);
    const validationIssues = successfulResults
      .filter((r) => r.data?.validation && !r.data.validation.valid)
      .map((r) => ({
        student: r.data.student,
        rollNo: r.data.rollNo,
        errors: r.data.validation.errors,
      }));

    const anomalyReports = successfulResults
      .filter(
        (r) => r.data?.anomalies && Object.keys(r.data.anomalies).length > 0
      )
      .map((r) => ({
        student: r.data.student,
        rollNo: r.data.rollNo,
        anomalies: r.data.anomalies,
      }));

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎯 BATCH REFETCH COMPLETE`);
    console.log(`${"=".repeat(60)}`);
    console.log(`📊 Total Students: ${stats.total}`);
    console.log(`✅ Successfully Updated: ${stats.succeeded}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`⚡ Average per Student: ${(duration / stats.total).toFixed(0)}ms`);
    console.log(`🔍 Validation Issues: ${validationIssues.length}`);
    console.log(`⚠️  Anomalies Detected: ${anomalyReports.length}`);
    console.log(`📆 Completed at: ${new Date().toLocaleString()}`);
    console.log(`${"=".repeat(60)}\n`);

    res.status(200).json({
      success: true,
      stats: {
        total: stats.total,
        succeeded: stats.succeeded,
        failed: stats.failed,
        skipped: stats.skipped,
        duration: duration,
        averagePerStudent: Math.round(duration / stats.total),
      },
      failedStudents,
      validationIssues,
      anomalyReports,
      updatedAt: now,
    });
  } catch (error) {
    console.error("❌ Fatal error during batch refetch:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refetch stats for all students",
      message: error.message,
    });
  }
};

// Refetch stats for all students across all departments
exports.refetchAllStudents = async (_req, res) => {
  const start = Date.now();
  const now = new Date();

  const summary = {
    departments: 0,
    classes: 0,
    totalStudents: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalPlatformsUpdated: 0,
    totalPlatformErrors: 0,
    validationIssues: [],
    anomalies: [],
  };

  try {
    const departments = await Department.find();
    summary.departments = departments.length;

    const validator = new DataValidator();

    for (const department of departments) {
      const classes = await Class.find({ department: department._id });
      summary.classes += classes.length;

      for (const classItem of classes) {
        const students = await Student.find({ classId: classItem._id });
        summary.totalStudents += students.length;

        if (!students.length) continue;

        const processor = new BatchProcessor({
          concurrency: 5,
          batchSize: 12,
          retryAttempts: 2,
          timeout: 60000,
        });

        const { stats } = await processor.processBatch(
          students,
          async (student) => {
            const newStats = await getStatsForStudent(
              student,
              student.stats || {}
            );
            const validation = validator.validateAll(newStats);

            const anomalies = {};
            for (const platform of Object.keys(newStats)) {
              const platformAnomalies = validator.detectAnomalies(
                student.stats?.[platform],
                newStats[platform],
                platform
              );
              if (platformAnomalies.length > 0) {
                anomalies[platform] = platformAnomalies;
              }
            }

            const mergedStats = { ...(student.stats || {}) };
            for (const [platform, platformStats] of Object.entries(newStats)) {
              if (!platformStats.error) {
                mergedStats[platform] = platformStats;
                summary.totalPlatformsUpdated++;
              } else {
                summary.totalPlatformErrors++;
              }
            }

            await Student.findByIdAndUpdate(student._id, {
              stats: mergedStats,
              updatedAt: now,
            });

            if (
              !validation.valid &&
              summary.validationIssues.length < 20
            ) {
              summary.validationIssues.push({
                student: student.name,
                rollNo: student.rollNo,
                errors: validation.errors.slice(0, 3),
                department: department.name,
                class: classItem.name,
              });
            }

            if (
              Object.keys(anomalies).length > 0 &&
              summary.anomalies.length < 20
            ) {
              summary.anomalies.push({
                student: student.name,
                rollNo: student.rollNo,
                anomalies,
                department: department.name,
                class: classItem.name,
              });
            }

            return { success: true };
          }
        );

        summary.succeeded += stats.succeeded;
        summary.failed += stats.failed;
        summary.skipped += stats.skipped;

        await Class.findByIdAndUpdate(classItem._id, {
          studentsUpdatedAt: now,
        });
      }
    }

    const durationMs = Date.now() - start;
    const durationSec = (durationMs / 1000).toFixed(2);

    res.status(200).json({
      success: true,
      durationMs,
      durationSec,
      ...summary,
    });
  } catch (error) {
    console.error("❌ ERROR in refetchAllStudents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refetch all students",
      message: error.message,
    });
  }
};

// Get student by ID
exports.getStudent = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const name = decoded.username;
    const studentData = await Student.findOne({ name }).populate("department");

    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { password, ...studentWithoutPassword } = studentData.toObject();
    res.status(200).json({ student: studentWithoutPassword });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

// Student login
exports.loginStudent = async (req, res) => {
  const { rollNo, password } = req.body;

  if (!rollNo || !password) {
    return res
      .status(400)
      .json({ message: "Roll number and password are required" });
  }

  try {
    const student = await Student.findOne({
      rollNo: new RegExp(`^${rollNo}$`, "i"),
    });

    if (!student || !student.password) {
      return res
        .status(401)
        .json({ message: "Invalid roll number or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid roll number or password" });
    }

    const studentWithoutPassword = student.toObject();
    delete studentWithoutPassword.password;

    const token = await generateToken(student.name, student._id);

    return res.status(200).json({
      token,
      student: studentWithoutPassword,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change student password
exports.changeStudentPassword = async (req, res) => {
  try {
    const { studentId, oldPassword, newPassword } = req.body;

    if (!studentId || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Student ID, old password, and new password are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    await student.save();

    console.log(`✅ Password changed for: ${student.name}`);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("🔥 Error in change-password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
