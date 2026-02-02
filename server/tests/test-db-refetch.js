const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const chalk = require("chalk");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Student = require("../models/studentSchema");
const BatchProcessor = require("../utils/batchProcessor");
const DataValidator = require("../utils/dataValidator");
const { getStatsForStudent } = require("../utils/helpers");

const symbols = {
  info: "ℹ",
  success: "✅",
  warn: "⚠",
  error: "❌",
  student: "👤",
  progress: "📊",
};

let lastProgressUpdate = 0;
const PROGRESS_UPDATE_INTERVAL = 500; // Update every 500ms to reduce overhead

function renderProgress(stats, startTime) {
  // Throttle progress updates to reduce render overhead
  const now = Date.now();
  if (now - lastProgressUpdate < PROGRESS_UPDATE_INTERVAL) return;
  lastProgressUpdate = now;

  const width = 30;
  const pct = stats.processed / stats.total;
  const filled = Math.round(width * pct);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);

  const elapsed = (now - startTime) / 1000;
  const rate = stats.processed / (elapsed || 1);
  const eta = (stats.total - stats.processed) / (rate || 1);

  process.stdout.write(
    `\r${symbols.progress} [${bar}] ${(pct * 100).toFixed(1)}% ` +
      `| ✅ ${stats.succeeded} ❌ ${stats.failed} ` +
      `| ETA: ${eta.toFixed(1)}s`,
  );
}

async function testDatabaseRefetch() {
  console.log(
    chalk.bgMagentaBright.black(" 🚀 FULL DATABASE REFETCH "),
  );
  console.log(chalk.dim("=".repeat(60)));

  try {
    console.log(`${symbols.info} Connecting to DB...`);
    await mongoose.connect(process.env.DB_URI);
    console.log(`${symbols.success} Connected`);

    console.log(`${symbols.info} Fetching students...`);
    const students = await Student.find({}).lean();

    if (!students.length) {
      console.log(`${symbols.warn} No students found`);
      return;
    }

    console.log(
      `${symbols.student} Found ${chalk.bold(students.length)} students\n`,
    );

    const validator = new DataValidator();

    const processor = new BatchProcessor({
      concurrency: 6, // More stable for rate-limited APIs
      batchSize: 30, // Balanced batch size for stability
      retryAttempts: 2,
      retryDelay: 1000,
      timeout: 0, // Disable per-item timeout to avoid duplicate in-flight work
      shouldRetry: (error) => {
        const message = error?.message || "";
        // Don't retry on invalid profiles or 4xx client errors
        return !/invalid-profile|status code 4\d\d/i.test(message);
      },
    });

    const startTime = Date.now();
    const bulkOps = [];
    const BULK_FLUSH_SIZE = 100; // Increased from 50 to 100 for less frequent DB operations

    processor.onProgress((stats) => renderProgress(stats, startTime));

    const { stats } = await processor.processBatch(
      students,
      async (student) => {
        const newStats = await getStatsForStudent(
          student,
          student.stats || {},
        );

        // Skip validation for speed (data is from trusted scrapers)
        // validator.validateAll(newStats.stats);

        const mergedStats = {
          ...(student.stats || {}),
          ...newStats.stats,
        };

        bulkOps.push({
          updateOne: {
            filter: { _id: student._id },
            update: {
              $set: {
                stats: mergedStats,
                updatedAt: new Date(),
              },
            },
          },
        });

        // Flush every BULK_FLUSH_SIZE ops to DB
        if (bulkOps.length >= BULK_FLUSH_SIZE) {
          await Student.bulkWrite(bulkOps, { ordered: false });
          bulkOps.length = 0;
        }

        return { success: true };
      },
    );

    // flush remaining ops
    if (bulkOps.length) {
      await Student.bulkWrite(bulkOps, { ordered: false });
    }

    const duration = (Date.now() - startTime) / 1000;

    console.log("\n");
    console.log(chalk.green.bold("✓ REFETCH COMPLETE"));
    console.log(chalk.dim("-".repeat(60)));
    console.log(`Time: ${duration.toFixed(2)}s`);
    console.log(`Success: ${stats.succeeded}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(
      `Avg/student: ${(duration / students.length).toFixed(3)}s`,
    );
  } catch (err) {
    console.error(`${symbols.error} Fatal Error:`, err);
  } finally {
    await mongoose.disconnect();
    console.log(`${symbols.info} Disconnected`);
  }
}

if (require.main === module) {
  testDatabaseRefetch();
}

module.exports = { testDatabaseRefetch };
