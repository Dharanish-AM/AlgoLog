const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const chalk = require("chalk");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Student = require("../models/studentSchema");
const BatchProcessor = require("../utils/batchProcessor");
const DataValidator = require("../utils/dataValidator");
const { getStatsForStudent } = require("../utils/helpers");

const symbols = {
  info: "ℹ️ ",
  success: "✅",
  warn: "⚠️ ",
  error: "❌",
  title: "🚀",
  student: "👤",
  progress: "📊",
};

async function testDatabaseRefetch() {
  console.log(
    chalk.bgMagentaBright.black(` ${symbols.title} FULL DB REFETCH `),
  );
  console.log(chalk.dim("=".repeat(50)));

  try {
    // 1. Connect to DB
    console.log(`${symbols.info} Connecting to DB...`);
    await mongoose.connect(process.env.DB_URI);
    console.log(`${symbols.success} Connected.`);

    // 2. Fetch all students
    console.log(`${symbols.info} Fetching all students...`);
    const students = await Student.find({}).lean(); // lean because we just need data, will update via ID

    if (students.length === 0) {
      console.log(`${symbols.warn} No students found.`);
      return;
    }

    console.log(
      `${symbols.student} Found ${chalk.bold(students.length)} students.`,
    );

    // 3. Process batches
    const validator = new DataValidator();
    const processor = new BatchProcessor({
      concurrency: 5, // Reduced from 10 to avoid CodeChef 429
      batchSize: 20,
      retryAttempts: 1,
      timeout: 45000,
    });

    let startTime = Date.now();

    processor.onProgress((stats) => {
      const percentage = stats.percentage.toFixed(1);
      process.stdout.write(
        `\r${symbols.progress} Processed: ${stats.processed}/${stats.total} (${percentage}%) | ✅ ${stats.succeeded} | ❌ ${stats.failed}`,
      );
    });

    const { results, stats } = await processor.processBatch(
      students,
      async (student) => {
        // This function runs for each student
        try {
          // Fetch new stats
          // Note: getStatsForStudent in helpers.js handles the fetching logic for each platform
          const newStats = await getStatsForStudent(
            student,
            student.stats || {},
          );

          // Validate
          const validation = validator.validateAll(newStats.stats);

          // Prepare updates
          // We merge stats to ensure we don't lose data if a platform fails transiently (handled inside getStatsForStudent usually, but being safe)
          const mergedStats = { ...(student.stats || {}), ...newStats.stats };

          // Update DB
          await Student.findByIdAndUpdate(student._id, {
            stats: mergedStats,
            updatedAt: new Date(),
          });

          return {
            success: true,
            student: student.name,
            rollNo: student.rollNo,
            validation,
          };
        } catch (err) {
          throw err;
        }
      },
    );

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n\n${symbols.success} Complete!`);
    console.log(chalk.dim("-".repeat(50)));
    console.log(`Total Time: ${duration.toFixed(2)}s`);
    console.log(
      `Avg Time/Student: ${(duration / students.length).toFixed(3)}s`,
    );
    console.log(`Success: ${stats.succeeded}`);
    console.log(`Failed: ${stats.failed}`);

    // Log failures
    if (stats.failed > 0) {
      console.log(chalk.red("\nFailures:"));
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          const errMsg =
            r.error && r.error.message ? r.error.message : String(r.error);
          console.log(`- ${r.item.name} (${r.item.rollNo}): ${errMsg}`);
        });
    }
  } catch (err) {
    console.error(`${symbols.error} Fatal Error:`, err);
  } finally {
    await mongoose.disconnect();
    console.log(`${symbols.info} Disconnected.`);
  }
}

// Run if main
if (require.main === module) {
  testDatabaseRefetch();
}

module.exports = { testDatabaseRefetch };
