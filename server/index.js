const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/studentSchema");
const dotenv = require("dotenv");
const cron = require("node-cron");
const Class = require("./models/classSchema");
const Admin = require("./models/adminSchema");
const PORT = process.env.PORT || 8000;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getCodeChefStats,
  getHackerRankStats,
  getLeetCodeStats,
  getTryHackMeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
  getLeetCodeQuestionOfToday,
} = require("./scrapers/scraper");
const { generateToken } = require("./utils/jwt");
const Department = require("./models/departmentSchema");
const BatchProcessor = require("./utils/batchProcessor");
const DataValidator = require("./utils/dataValidator");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

mongoose
  .connect(`${process.env.DB_URI}`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

async function withRetry(
  promiseFn,
  retries = 1,
  platform = "Unknown",
  identifier = "N/A"
) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.debug(`[${platform}] Attempt ${attempt} for ${identifier}`);
      const result = await promiseFn();
      console.info(
        `[${platform}] ✅ Success for ${identifier} on attempt ${attempt}`
      );
      return result;
    } catch (err) {
      console.warn(
        `[${platform}] ❌ Attempt ${attempt} failed for ${identifier}: ${err.message}`
      );
      if (attempt > retries) throw err;
    }
  }
}

function formatError(platform, identifier, extraFields = {}, isUrl = false) {
  const errorMessage = identifier
    ? isUrl
      ? identifier.startsWith("http")
        ? "Failed to fetch"
        : "Invalid URL"
      : "Failed to fetch"
    : isUrl
    ? "URL missing"
    : "Username missing";

  return {
    platform,
    updatedAt: new Date().toISOString(),
    ...extraFields,
    error: errorMessage,
  };
}

async function getStatsForStudent(student, oldStats = {}) {
  const {
    _id,
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
  } = student;

  console.log(`\n🔍 Starting fetch for student: ${name} (${rollNo})`);

  const platforms = [
    {
      key: "leetcode",
      value: leetcode,
      isUrl: false,
      fetchFn: getLeetCodeStats,
    },
    {
      key: "hackerrank",
      value: hackerrank,
      isUrl: false,
      fetchFn: getHackerRankStats,
    },
    {
      key: "codechef",
      value: codechef,
      isUrl: false,
      fetchFn: getCodeChefStats,
    },
    { key: "github", value: github, isUrl: false, fetchFn: getGithubStats },
    {
      key: "codeforces",
      value: codeforces,
      isUrl: false,
      fetchFn: getCodeforcesStats,
    },
    {
      key: "skillrack",
      value: skillrack,
      isUrl: true,
      fetchFn: getSkillrackStats,
    },
  ];

  const statsEntries = await Promise.allSettled(
    platforms.map(async ({ key, value, isUrl, fetchFn }) => {
      const platformName = key.charAt(0).toUpperCase() + key.slice(1);

      if (!value || (isUrl && !value.startsWith("http"))) {
        console.warn(
          `[${platformName}] ⚠️ Skipping due to invalid or missing identifier.`
        );
        return [
          key,
          oldStats[key] || formatError(platformName, value, {}, isUrl),
        ];
      }

      try {
        const result = await withRetry(
          () => fetchFn(value),
          2,
          platformName,
          value
        );
        return [key, result];
      } catch (err) {
        console.warn(
          `[${platformName}] ❗ Using old stats due to fetch failure`
        );
        return [
          key,
          oldStats[key] || formatError(platformName, value, {}, isUrl),
        ];
      }
    })
  );

  const finalStats = Object.fromEntries(
    statsEntries.map((entry) => entry.value)
  );

  console.log(`✅ Finished fetching all platforms for: ${name} (${rollNo})`);

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats: finalStats,
  };
}

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/students", async (req, res) => {
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
});

app.get("/api/students/refetch", async (req, res) => {
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
      concurrency: 3, // Process 3 students at a time
      batchSize: 10,  // 10 students per batch
      retryAttempts: 1,
      timeout: 45000, // 45 seconds per student
    });

    let progressUpdate = null;

    // Set up progress tracking
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

    // Prepare data quality tracking
    const dataQualityUpdates = [];
    const updatePromises = []; // Collect update promises for parallel execution

    // Process all students in batches
    const { results, stats, errors } = await processor.processBatch(
      students,
      async (student, index) => {
        console.log(`\n🔄 [${index + 1}/${students.length}] Processing ${student.name} (${student.rollNo})`);

        try {
          // Fetch new stats
          const updatedStats = await getStatsForStudent(student, student.stats);

          // Validate the new stats
          const validation = validator.validateAll(updatedStats.stats);
          
          if (!validation.valid) {
            console.warn(
              `⚠️  Validation issues for ${student.name}:`,
              validation.errors
            );
          }

          if (validation.warnings.length > 0) {
            console.warn(
              `⚡ Warnings for ${student.name}:`,
              validation.warnings
            );
          }

          // Detect anomalies by comparing with old stats
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

          // Merge stats - only update platforms without errors
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

          // Calculate data quality score
          const avgValidationScore = Object.values(validation.platforms)
            .reduce((sum, p) => sum + (p.score || 0), 0) / 
            Object.keys(validation.platforms).length;

          // Prepare parallel update (individual updates are faster than bulk)
          const updatePromise = Student.findByIdAndUpdate(student._id, {
            $set: {
              stats: mergedStats,
              updatedAt: now,
              dataQuality: {
                score: avgValidationScore,
                lastValidation: now,
                platformsUpdated,
                hasAnomalies: Object.keys(anomalies).length > 0,
              }
            },
            // 9. Data quality - Historical tracking
            $push: {
              statsHistory: {
                $each: [{
                  timestamp: now,
                  stats: mergedStats,
                  validationScore: avgValidationScore,
                  anomalies: Object.keys(anomalies).length > 0 ? anomalies : undefined,
                }],
                $slice: -10 // Keep last 10 history entries
              }
            }
          });
          
          // Collect promise for parallel execution
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
          console.error(
            `❌ Failed to process ${student.name}: ${error.message}`
          );
          throw error;
        }
      }
    );

    // Update class metadata
    await Class.findByIdAndUpdate(classId, {
      studentsUpdatedAt: now,
    });

    const duration = Date.now() - start;

    // Generate detailed report
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
      .filter((r) => r.data?.anomalies && Object.keys(r.data.anomalies).length > 0)
      .map((r) => ({
        student: r.data.student,
        rollNo: r.data.rollNo,
        anomalies: r.data.anomalies,
      }));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 BATCH REFETCH COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Total Students: ${stats.total}`);
    console.log(`✅ Successfully Updated: ${stats.succeeded}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`⚡ Average per Student: ${(duration / stats.total).toFixed(0)}ms`);
    console.log(`🔍 Validation Issues: ${validationIssues.length}`);
    console.log(`⚠️  Anomalies Detected: ${anomalyReports.length}`);
    console.log(`📆 Completed at: ${new Date().toLocaleString()}`);
    console.log(`${'='.repeat(60)}\n`);

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
});

// Refetch stats for all departments -> classes -> students
app.get("/api/students/refetch/all", async (_req, res) => {
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
            const newStats = await getStatsForStudent(student, student.stats || {});

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

            if (!validation.valid && summary.validationIssues.length < 20) {
              summary.validationIssues.push({
                student: student.name,
                rollNo: student.rollNo,
                errors: validation.errors.slice(0, 3),
                department: department.name,
                class: classItem.name,
              });
            }

            if (Object.keys(anomalies).length > 0 && summary.anomalies.length < 20) {
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
    console.error("❌ ERROR in /api/students/refetch/all:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refetch all students",
      message: error.message,
    });
  }
});

app.get("/api/students/refetch/single", async (req, res) => {
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

    // Initialize validator
    const validator = new DataValidator();

    // Fetch new stats
    const updatedStats = await getStatsForStudent(student, student.stats);
    const { stats } = updatedStats;

    // Validate new stats
    const validation = validator.validateAll(stats);
    
    console.log(`[VALIDATION] Overall valid: ${validation.valid}`);
    if (!validation.valid) {
      console.warn(`[VALIDATION] Errors:`, validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn(`[VALIDATION] Warnings:`, validation.warnings);
    }

    // Detect anomalies
    const anomalies = {};
    for (const platform of Object.keys(stats)) {
      const platformAnomalies = validator.detectAnomalies(
        student.stats?.[platform],
        stats[platform],
        platform
      );
      if (platformAnomalies.length > 0) {
        anomalies[platform] = platformAnomalies;
        console.warn(
          `[ANOMALY] ${platform}:`,
          platformAnomalies
        );
      }
    }

    // Check for failed platforms
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

    // Merge stats - only update successful platforms
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

    // Update student
    await Student.findByIdAndUpdate(
      id,
      { 
        stats: mergedStats,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Fetch updated student data
    const newStudentData = await Student.findById(id).populate("department");

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);

    // Calculate average validation score
    const avgScore = Object.values(validation.platforms)
      .reduce((sum, p) => sum + (p.score || 0), 0) / 
      Object.keys(validation.platforms).length;

    console.log(
      `[TIMER] Refetch for ${student.name} completed in ${durationMs}ms (~${durationSec}s)`
    );
    console.log(
      `[QUALITY] Validation score: ${avgScore.toFixed(1)}%`
    );

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
});

app.post("/api/students", async (req, res) => {
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

    // 🔍 Step 1: Validate department
    const departmentData = await Department.findById(department);
    if (!departmentData) {
      return res.status(404).json({
        error: "Department not found. Cannot proceed with class lookup.",
      });
    }

    // 🔍 Step 2: Find class only if department is valid
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

    // 🔒 Step 3: Hash default password
    const password = "sece@123";
    const hashPass = await bcrypt.hash(password, 10);

    // 🧠 Step 4: Prepare student object
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

    // 📊 Step 5: Fetch stats (with fallback)
    let statsResult = { stats: {} };
    try {
      statsResult = await getStatsForStudent(studentInfo, studentInfo.stats);
    } catch (err) {
      console.warn("Stats fetch failed, proceeding with empty stats:", err);
    }

    // 🧾 Step 6: Save student
    const newStudent = new Student({
      ...studentInfo,
      stats: statsResult.stats,
    });

    const savedStudent = await newStudent.save();

    // 📌 Step 7: Add student ID to class document
    await Class.findByIdAndUpdate(classData._id, {
      $addToSet: { students: savedStudent._id }, // prevents duplicates
    });

    return res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).json({ error: "Failed to add student" });
  }
});

app.put("/api/students/:id", async (req, res) => {
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

    // 🔍 Step 1: Check if student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    // Determine department ID from object or string
    const departmentId =
      typeof department === "string" ? department : department?._id;

    if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const departmentData = await Department.findById(departmentId);
    if (!departmentData) {
      return res.status(404).json({ error: "Department not found" });
    }

    // 🔍 Step 3: Validate class
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

    // 📊 Step 4: Update stats
    const updatedStats = await getStatsForStudent(
      { _id: existingStudent._id, ...updatedData },
      existingStudent.stats || {}
    );

    // 🔁 Step 5: Update student document and populate department
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats: updatedStats?.stats || existingStudent.stats,
      },
      { new: true }
    ).populate("department");

    // 🔄 Step 6: If class has changed, update class arrays
    if (existingStudent.classId?.toString() !== classData._id.toString()) {
      // Remove from old class
      if (existingStudent.classId) {
        await Class.findByIdAndUpdate(existingStudent.classId, {
          $pull: { students: existingStudent._id },
        });
      }

      // Add to new class
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
});

app.post("/api/class/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const currentClass = await Class.findOne({ username }).populate(
      "department"
    );
    if (!currentClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      currentClass.password
    );
    if (!isPasswordMatch) {
      console.log("Invalid Credentials!");
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = await generateToken(currentClass.username, currentClass._id);

    const { password: _, ...classWithoutPassword } = currentClass.toObject();

    return res.status(200).json({
      message: "Login successful",
      class: classWithoutPassword,
      token,
    });
  } catch (err) {
    console.error("Error logging in class:", err);
    return res.status(500).json({ error: "Failed to log in class" });
  }
});

app.post("/api/class/register", async (req, res) => {
  try {
    const { password, email, departmentId, section, year } = req.body;

    if (!password || !email || !departmentId || !year) {
      return res
        .status(400)
        .json({ message: "Username, password, name, and email are required" });
    }

    const existingClass = await Class.findOne({ email });
    if (existingClass) {
      return res.status(409).json({ message: "Class already exists" });
    }

    const classDepartment = await Department.findById(departmentId);

    if (!classDepartment) {
      return res.status(400).json({ message: "Department Not Found!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUserName;
    let attempt = 0;
    do {
      const currentTime = new Date().getTime().toString().slice(-4);
      newUserName = `${classDepartment.name}${section}${currentTime}`;
      const existingUsername = await Class.findOne({ username: newUserName });
      if (!existingUsername) break;
      attempt++;
    } while (attempt < 5);

    if (attempt === 5) {
      return res.status(500).json({
        message: "Failed to generate unique username. Please try again.",
      });
    }

    const newClass = new Class({
      username: newUserName,
      email,
      department: classDepartment._id,
      password: hashedPassword,
      section,
      year,
    });

    await newClass.save();

    if (classDepartment) {
      classDepartment.classes.push(newClass._id);
      await classDepartment.save();
    }

    res.status(201).json({
      message: "Class registered successfully",
      class: { username: newUserName, email, _id: newClass._id },
    });
  } catch (err) {
    console.error("Error registering class:", err);
    res.status(500).json({ error: "Failed to register class" });
  }
});

app.post("/api/department/login", async (req, res) => {
  const { departmentId, password } = req.body;
  if (!departmentId || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const department = await Department.findById(departmentId);
  if (!department || !department.password) {
    return res.status(404).json({ message: "Department not found" });
  }

  const isMatch = await bcrypt.compare(password, department.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = await generateToken(department.name, department._id);
  const deptWithoutPass = department.toObject();
  delete deptWithoutPass.password;

  res.status(200).json({ token, department: deptWithoutPass });
});

app.get("/api/departments", async (req, res) => {
  try {
    const departments = await Department.find({}).populate("classes");
    if (!departments || departments.length === 0) {
      return res.status(200).json({ departments: [] });
    }

    res.status(200).json({ departments });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

app.post("/api/department/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    const existing = await Department.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) {
      return res.status(409).json({ error: "Department already exists" });
    }

    const pass = `${name}@123`;
    const hashPass = await bcrypt.hash(pass, 10);

    const newDepartment = new Department({ name, classes: [] });
    newDepartment.password = hashPass;
    await newDepartment.save();

    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ error: "Failed to create department" });
  }
});

app.post("/api/check-token", async (req, res) => {
  try {
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

app.post("/api/class/change-password", async (req, res) => {
  try {
    const { classId, oldPassword, newPassword } = req.body;

    if (!classId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      classData.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    classData.password = hashedPassword;

    await classData.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/get-user", async (req, res) => {
  try {
    const token = req.body?.token;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const [departmentData, admin, classData] = await Promise.all([
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
    ]);

    if (departmentData) {
      return res.status(200).json({ user: departmentData, role: "department" });
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
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.post("/api/class/update-class", async (req, res) => {
  try {
    const { classId, formData } = req.body;

    if (!classId || !formData) {
      return res
        .status(400)
        .json({ message: "classId and formData are required" });
    }

    const deptId = await Department.findOne({
      name: formData.department,
    });

    formData.department = deptId;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: formData },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (err) {
    console.error("Error updating class:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/create", (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newAdmin = new Admin({
    name,
    email,
    password: hashedPassword,
  });

  newAdmin
    .save()
    .then(() => {
      res.status(200).json({ message: "Admin created successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed to create admin" });
    });
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    let adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;

    const token = await generateToken(admin.username, admin._id);
    res.status(200).json({ token, admin: adminWithoutPassword });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.get("/api/admin/get-admin", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const username = decoded.username;
    const adminData = await Admin.findOne({ username });
    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { password, ...adminWithoutPassword } = adminData.toObject();
    res.status(200).json({ admin: adminWithoutPassword });
  } catch (err) {
    console.error("Error fetching admin:", err);
    res.status(500).json({ message: "Failed to fetch admin" });
  }
});

app.get("/api/admin/get-departments", async (req, res) => {
  try {
    const departments = await Department.find().select("-password");
    res.status(200).json({ departments });
  } catch (err) {
    console.error("Error fetching departments:", err);
    rt;
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

app.get("/api/admin/get-classes", async (req, res) => {
  try {
    const classes = await Class.find().populate({
      path: "students",
      populate: {
        path: "department",
        select: "_id name",
      },
    });

    res.status(200).json({ classes });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
});

//student

app.post("/api/student/login", async (req, res) => {
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
});

app.delete("/api/students/:id", async (req, res) => {
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
});

app.get("/api/student/get-student", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
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
});

app.post("/api/student/change-password", async (req, res) => {
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
});

app.get("/api/get-form-details", async (req, res) => {
  try {
    const departments = await Department.find();

    const departmentDetails = await Promise.all(
      departments.map(async (dept) => {
        const classes = await Class.find({
          _id: { $in: dept.classes },
        });

        const uniqueSections = [...new Set(classes.map((cls) => cls.section))];

        return {
          _id: dept._id,
          name: dept.name,
          sections: uniqueSections,
        };
      })
    );

    res.status(200).json(departmentDetails);
  } catch (err) {
    console.error("Error fetching form details:", err);
    res.status(500).json({ error: "Failed to fetch department details" });
  }
});

app.get("/api/get-daily-leetcode-problem", async (req, res) => {
  try {
    const problem = await getLeetCodeQuestionOfToday();
    res.status(200).json({ problem });
  } catch (err) {
    console.error("Error fetching daily problem:", err);
    res.status(500).json({ error: "Failed to fetch daily problem" });
  }
});

app.get("/api/students/all", async (req, res) => {
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
});

app.get("/api/contests/all", async (req, res) => {
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

    // Return only response.data.data.allContests as JSON
    res.status(200).json({ contests: response.data.data.allContests });
  } catch (err) {
    console.error("Error fetching contests:", err);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
