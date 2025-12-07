/**
 * Test script for refetching all students from database
 * This tests the complete batch refetch workflow with real database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Student = require('../models/studentSchema');
const Class = require('../models/classSchema');
const Department = require('../models/departmentSchema');
const BatchProcessor = require('../utils/batchProcessor');
const DataValidator = require('../utils/dataValidator');

const {
  getCodeChefStats,
  getHackerRankStats,
  getLeetCodeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
} = require('../scrapers/scraper');

/**
 * Fetch stats for a single student
 */
async function getStatsForStudent(student, oldStats = {}) {
  const {
    name,
    rollNo,
    leetcode,
    hackerrank,
    codechef,
    codeforces,
    skillrack,
    github,
  } = student;

  console.log(`\n🔍 Fetching stats for: ${name} (${rollNo})`);

  const platforms = [
    { key: 'leetcode', value: leetcode, fetchFn: getLeetCodeStats },
    { key: 'hackerrank', value: hackerrank, fetchFn: getHackerRankStats },
    { key: 'codechef', value: codechef, fetchFn: getCodeChefStats },
    { key: 'github', value: github, fetchFn: getGithubStats },
    { key: 'codeforces', value: codeforces, fetchFn: getCodeforcesStats },
    { key: 'skillrack', value: skillrack, fetchFn: getSkillrackStats, isUrl: true },
  ];

  const statsPromises = platforms.map(async ({ key, value, fetchFn, isUrl }) => {
    if (!value || (isUrl && !value.startsWith('http'))) {
      return [key, oldStats[key] || { error: 'No identifier provided' }];
    }

    try {
      const result = await fetchFn(value);
      return [key, result];
    } catch (err) {
      console.warn(`  ⚠️  ${key} failed: ${err.message}`);
      return [key, oldStats[key] || { error: err.message }];
    }
  });

  const statsEntries = await Promise.allSettled(statsPromises);
  const finalStats = Object.fromEntries(
    statsEntries
      .filter(e => e.status === 'fulfilled')
      .map(e => e.value)
  );

  return finalStats;
}

/**
 * Main test function - Process all departments, classes, and students
 */
async function testDatabaseRefetch() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 TESTING COMPLETE DATABASE BATCH REFETCH');
  console.log('   Processing: Departments → Classes → Students');
  console.log('='.repeat(80));

  const overallStartTime = Date.now();
  const globalStats = {
    departments: 0,
    classes: 0,
    totalStudents: 0,
    processedStudents: 0,
    successfulStudents: 0,
    failedStudents: 0,
    skippedStudents: 0,
    totalPlatformsUpdated: 0,
    totalPlatformErrors: 0,
    validationIssues: [],
    anomalies: [],
    departmentResults: [],
  };

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all departments
    console.log('\n🏢 Fetching departments...');
    const departments = await Department.find();
    globalStats.departments = departments.length;
    
    if (!departments || departments.length === 0) {
      console.log('⚠️  No departments found in database');
      return;
    }

    console.log(`✅ Found ${departments.length} department(s):`);
    departments.forEach((dept, i) => {
      console.log(`   ${i + 1}. ${dept.name} (ID: ${dept._id})`);
    });

    const validator = new DataValidator();

    // Process each department
    for (let deptIndex = 0; deptIndex < departments.length; deptIndex++) {
      const department = departments[deptIndex];
      const deptStartTime = Date.now();

      console.log('\n' + '─'.repeat(80));
      console.log(`🏢 DEPARTMENT ${deptIndex + 1}/${departments.length}: ${department.name}`);
      console.log('─'.repeat(80));

      const deptStats = {
        departmentName: department.name,
        departmentId: department._id.toString(),
        classes: 0,
        totalStudents: 0,
        successfulStudents: 0,
        failedStudents: 0,
        duration: 0,
        classResults: [],
      };

      // Get all classes for this department
      const classes = await Class.find({ department: department._id });
      deptStats.classes = classes.length;
      globalStats.classes += classes.length;

      if (!classes || classes.length === 0) {
        console.log(`⚠️  No classes found for ${department.name}`);
        globalStats.departmentResults.push(deptStats);
        continue;
      }

      console.log(`📚 Found ${classes.length} class(es) in ${department.name}`);

      // Process each class
      for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        const classItem = classes[classIndex];
        const classStartTime = Date.now();

        console.log(`\n  📖 Class ${classIndex + 1}/${classes.length}: ${classItem.name || classItem._id}`);

        const classStats = {
          className: classItem.name || 'Unnamed',
          classId: classItem._id.toString(),
          totalStudents: 0,
          successfulStudents: 0,
          failedStudents: 0,
          duration: 0,
        };

        // Get all students for this class
        const students = await Student.find({ classId: classItem._id });
        classStats.totalStudents = students.length;
        deptStats.totalStudents += students.length;
        globalStats.totalStudents += students.length;

        if (!students || students.length === 0) {
          console.log(`    ⚠️  No students found in this class`);
          deptStats.classResults.push(classStats);
          continue;
        }

        console.log(`    👥 Processing ${students.length} student(s)...`);

        // Initialize batch processor for this class
        const processor = new BatchProcessor({
          concurrency: 3, // Reduced from 5 to 3 to avoid rate limits
          batchSize: 8,   // Reduced from 10 to 8 for better control
          retryAttempts: 2, // Increased from 1 to 2 for better retry handling
          timeout: 60000, // Increased to 60 seconds for slower platforms
        });

        let batchProgress = 0;

        // Progress tracking
        processor.onProgress((stats) => {
          if (stats.processed > batchProgress) {
            batchProgress = stats.processed;
            const percentage = stats.percentage.toFixed(1);
            const succeeded = stats.succeeded;
            const failed = stats.failed;
            console.log(
              `       📊 ${stats.processed}/${stats.total} (${percentage}%) - ` +
              `✅ ${succeeded} | ❌ ${failed}`
            );
          }
        });

        // Process all students in this class
        const { results: batchResults, stats } = await processor.processBatch(
          students,
          async (student, index) => {
            try {
              // Fetch new stats
              const newStats = await getStatsForStudent(student, student.stats || {});

              // Validate stats
              const validation = validator.validateAll(newStats);

              // Detect anomalies
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

              // Merge stats - only update successful platforms
              const mergedStats = { ...(student.stats || {}) };
              let updatedPlatforms = 0;
              let errorPlatforms = 0;

              for (const [platform, platformStats] of Object.entries(newStats)) {
                if (!platformStats.error) {
                  mergedStats[platform] = platformStats;
                  updatedPlatforms++;
                  globalStats.totalPlatformsUpdated++;
                } else {
                  errorPlatforms++;
                  globalStats.totalPlatformErrors++;
                }
              }

              // Update in database
              await Student.findByIdAndUpdate(student._id, {
                stats: mergedStats,
                updatedAt: new Date(),
              });

              // Track validation issues
              if (!validation.valid) {
                globalStats.validationIssues.push({
                  department: department.name,
                  class: classItem.name || 'Unnamed',
                  student: student.name,
                  rollNo: student.rollNo,
                  errors: validation.errors,
                });
              }

              // Track anomalies
              if (Object.keys(anomalies).length > 0) {
                globalStats.anomalies.push({
                  department: department.name,
                  class: classItem.name || 'Unnamed',
                  student: student.name,
                  rollNo: student.rollNo,
                  anomalies,
                });
              }

              return {
                success: true,
                name: student.name,
                updatedPlatforms,
                errorPlatforms,
              };
            } catch (error) {
              throw error;
            }
          }
        );

        // Update class stats
        classStats.successfulStudents = stats.succeeded;
        classStats.failedStudents = stats.failed;
        classStats.duration = Date.now() - classStartTime;

        deptStats.successfulStudents += stats.succeeded;
        deptStats.failedStudents += stats.failed;
        globalStats.processedStudents += stats.processed;
        globalStats.successfulStudents += stats.succeeded;
        globalStats.failedStudents += stats.failed;
        globalStats.skippedStudents += stats.skipped;

        // Update class metadata
        await Class.findByIdAndUpdate(classItem._id, {
          studentsUpdatedAt: new Date(),
        });

        console.log(
          `    ✅ Class completed: ${stats.succeeded}/${students.length} successful ` +
          `(${(classStats.duration / 1000).toFixed(1)}s)`
        );

        deptStats.classResults.push(classStats);
      }

      // Update department stats
      deptStats.duration = Date.now() - deptStartTime;
      globalStats.departmentResults.push(deptStats);

      console.log(
        `\n🏢 Department "${department.name}" completed: ` +
        `${deptStats.successfulStudents}/${deptStats.totalStudents} students ` +
        `across ${deptStats.classes} classes (${(deptStats.duration / 1000).toFixed(1)}s)`
      );
    }

    const totalDuration = Date.now() - overallStartTime;

    // Print comprehensive results
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE DATABASE REFETCH RESULTS');
    console.log('='.repeat(80));

    console.log('\n🎯 Overall Summary:');
    console.log(`  🏢 Departments: ${globalStats.departments}`);
    console.log(`  📚 Classes: ${globalStats.classes}`);
    console.log(`  👥 Total Students: ${globalStats.totalStudents}`);
    console.log(`  ✅ Successfully Updated: ${globalStats.successfulStudents}`);
    console.log(`  ❌ Failed: ${globalStats.failedStudents}`);
    console.log(`  ⏭️  Skipped: ${globalStats.skippedStudents}`);
    console.log(`  📈 Success Rate: ${((globalStats.successfulStudents / globalStats.totalStudents) * 100).toFixed(1)}%`);
    console.log(`  🔧 Platforms Updated: ${globalStats.totalPlatformsUpdated}`);
    console.log(`  ⚠️  Platform Errors: ${globalStats.totalPlatformErrors}`);
    console.log(`  ⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s (${(totalDuration / 60000).toFixed(2)} min)`);
    console.log(`  ⚡ Average per Student: ${(totalDuration / globalStats.totalStudents).toFixed(0)}ms`);
    console.log(`  🚀 Throughput: ${(globalStats.totalStudents / (totalDuration / 1000)).toFixed(2)} students/sec`);

    // Department breakdown
    console.log('\n📋 Department Breakdown:');
    globalStats.departmentResults.forEach((dept, i) => {
      const successRate = dept.totalStudents > 0 
        ? ((dept.successfulStudents / dept.totalStudents) * 100).toFixed(1)
        : 0;
      console.log(
        `  ${i + 1}. ${dept.departmentName}: ` +
        `${dept.successfulStudents}/${dept.totalStudents} students ` +
        `across ${dept.classes} classes ` +
        `(${successRate}% success, ${(dept.duration / 1000).toFixed(1)}s)`
      );
    });

    // Validation issues
    if (globalStats.validationIssues.length > 0) {
      console.log(`\n⚠️  Validation Issues (${globalStats.validationIssues.length}):`);
      const displayLimit = 10;
      globalStats.validationIssues.slice(0, displayLimit).forEach((issue, i) => {
        console.log(
          `  ${i + 1}. ${issue.department} → ${issue.class} → ` +
          `${issue.student} (${issue.rollNo})`
        );
        issue.errors.slice(0, 2).forEach(err => console.log(`     - ${err}`));
      });
      if (globalStats.validationIssues.length > displayLimit) {
        console.log(`  ... and ${globalStats.validationIssues.length - displayLimit} more`);
      }
    }

    // Anomalies
    if (globalStats.anomalies.length > 0) {
      console.log(`\n🔍 Anomalies Detected (${globalStats.anomalies.length}):`);
      const displayLimit = 10;
      globalStats.anomalies.slice(0, displayLimit).forEach((anomaly, i) => {
        console.log(
          `  ${i + 1}. ${anomaly.department} → ${anomaly.class} → ` +
          `${anomaly.student} (${anomaly.rollNo})`
        );
        const platforms = Object.keys(anomaly.anomalies);
        platforms.slice(0, 2).forEach(platform => {
          anomaly.anomalies[platform].slice(0, 1).forEach(issue => {
            console.log(`     ${platform}: ${issue}`);
          });
        });
      });
      if (globalStats.anomalies.length > displayLimit) {
        console.log(`  ... and ${globalStats.anomalies.length - displayLimit} more`);
      }
    }

    // Performance metrics
    console.log('\n⚡ Performance Metrics:');
    const avgDeptTime = totalDuration / globalStats.departments;
    const avgClassTime = totalDuration / globalStats.classes;
    const avgStudentTime = totalDuration / globalStats.totalStudents;
    console.log(`  Average per Department: ${(avgDeptTime / 1000).toFixed(2)}s`);
    console.log(`  Average per Class: ${(avgClassTime / 1000).toFixed(2)}s`);
    console.log(`  Average per Student: ${avgStudentTime.toFixed(0)}ms`);
    console.log(`  Estimated time for 1000 students: ${((avgStudentTime * 1000) / 60000).toFixed(2)} min`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPLETE DATABASE REFETCH SUCCESSFUL');
    console.log('='.repeat(80) + '\n');

    return globalStats;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the test
if (require.main === module) {
  testDatabaseRefetch()
    .then(() => {
      console.log('🎉 All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test crashed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseRefetch };
