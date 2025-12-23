const chalk = require("chalk");

function line(char = "=", len = 70) {
  return "".padEnd(len, char);
}

function logSingleRefetch({
  studentName,
  rollNo,
  departmentName,
  className,
  durationMs,
  durationSec,
  avgScore,
  validation,
  platformsUpdatedCount,
  platformsTotalCount,
  failedPlatforms = [],
  anomalies = {},
  timestamp,
}) {
  console.log(`\n${line("=")}`);
  console.log(`✅ SINGLE STUDENT REFETCH COMPLETE`);
  console.log(`${line("=")}`);
  console.log(`👤 Student: ${studentName} (${rollNo || "N/A"})`);
  console.log(`🏢 Department: ${departmentName || "Unknown"}`);
  console.log(`📚 Class: ${className || "Unknown"}`);
  console.log(`⏱️  Duration: ${durationMs}ms (${durationSec}s)`);
  console.log(`📊 Validation Score: ${avgScore.toFixed(1)}%`);
  console.log(
    `✓ Status: ${validation.valid ? "Valid" : "Invalid"} | Errors: ${
      validation.errors?.length || 0
    } | Warnings: ${validation.warnings?.length || 0}`
  );
  console.log(
    `🔄 Platforms: ${platformsUpdatedCount}/${platformsTotalCount} updated`
  );
  if (failedPlatforms.length > 0) {
    console.log(`⚠️  Failed: ${failedPlatforms.join(", ")}`);
  }
  const anomalyKeys = Object.keys(anomalies || {});
  if (anomalyKeys.length > 0) {
    console.log(`🔍 Anomalies in: ${anomalyKeys.join(", ")}`);
  }
  console.log(`${line("=")}\n`);
}

function logSingleRefetchError({ durationSec, errorMessage }) {
  console.error(`\n${line("=")}`);
  console.error(`❌ SINGLE STUDENT REFETCH FAILED`);
  console.error(`${line("=")}`);
  console.error(`⏱️  Duration: ${durationSec}s`);
  console.error(`📛 Error: ${errorMessage}`);
  console.error(`📅 Failed at: ${new Date().toLocaleString()}`);
  console.error(`${line("=")}\n`);
}

function logClassRefetch({
  total,
  succeeded,
  failed,
  skipped,
  durationMs,
  avgPerStudentMs,
  validationIssuesCount,
  anomaliesCount,
  timestamp,
}) {
  console.log(`\n${line("=")}`);
  console.log(`✅ CLASS REFETCH COMPLETE`);
  console.log(`${line("=")}`);
  console.log(`📚 Total Students: ${total}`);
  console.log(
    `✓ Succeeded: ${succeeded} | ✗ Failed: ${failed} | ⏭️  Skipped: ${skipped}`
  );
  console.log(
    `⏱️  Duration: ${(durationMs / 1000).toFixed(2)}s (Avg: ${avgPerStudentMs}ms per student)`
  );
  console.log(
    `📊 Validation Issues: ${validationIssuesCount} | 🔍 Anomalies: ${anomaliesCount}`
  );
  console.log(`📅 Completed at: ${timestamp}`);
  console.log(`${line("=")}\n`);
}

function logClassRefetchError({ durationSec, errorMessage }) {
  console.error(`\n${line("=")}`);
  console.error(`❌ CLASS REFETCH FAILED`);
  console.error(`${line("=")}`);
  console.error(`⏱️  Duration: ${durationSec}s`);
  console.error(`📛 Error: ${errorMessage}`);
  console.error(`📅 Failed at: ${new Date().toLocaleString()}`);
  console.error(`${line("=")}\n`);
}

function logAllRefetch({
  departments,
  classes,
  totalStudents,
  succeeded,
  failed,
  skipped,
  totalPlatformsUpdated,
  totalPlatformErrors,
  durationMs,
  durationSec,
  avgPerStudentMs,
  validationIssuesCount,
  anomaliesCount,
  timestamp,
}) {
  console.log(`\n${line("=")}`);
  console.log(`✅ ALL STUDENTS REFETCH COMPLETE`);
  console.log(`${line("=")}`);
  console.log(`🏢 Departments: ${departments} | 📚 Classes: ${classes}`);
  console.log(`👥 Total Students: ${totalStudents}`);
  console.log(
    `✓ Succeeded: ${succeeded} | ✗ Failed: ${failed} | ⏭️  Skipped: ${skipped}`
  );
  console.log(
    `🔄 Platforms Updated: ${totalPlatformsUpdated} | ⚠️  Errors: ${totalPlatformErrors}`
  );
  console.log(
    `⏱️  Duration: ${durationSec}s (Avg: ${avgPerStudentMs}ms per student)`
  );
  console.log(
    `📊 Validation Issues: ${validationIssuesCount} | 🔍 Anomalies: ${anomaliesCount}`
  );
  console.log(`📅 Completed at: ${timestamp}`);
  console.log(`${line("=")}\n`);
}

function logAllRefetchError({ durationSec, errorMessage }) {
  console.error(`\n${line("=")}`);
  console.error(`❌ ALL STUDENTS REFETCH FAILED`);
  console.error(`${line("=")}`);
  console.error(`⏱️  Duration: ${durationSec}s`);
  console.error(`📛 Error: ${errorMessage}`);
  console.error(`📅 Failed at: ${new Date().toLocaleString()}`);
  console.error(`${line("=")}\n`);
}

module.exports = {
  logSingleRefetch,
  logSingleRefetchError,
  logClassRefetch,
  logClassRefetchError,
  logAllRefetch,
  logAllRefetchError,
};
