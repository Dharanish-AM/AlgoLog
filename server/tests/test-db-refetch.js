/**
 * Test script for refetching all students from database
 * This tests the complete batch refetch workflow with real database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const chalk = require('chalk');

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

/* -------------------------------------------------------------------------- */
/*                                LOGGER SETUP                                */
/* -------------------------------------------------------------------------- */

const symbols = {
  info: 'ℹ️ ',
  success: '✅',
  warn: '⚠️ ',
  error: '❌',
  title: '🚀',
  db: '📡',
  dept: '🏢',
  cls: '📚',
  student: '👤',
  progress: '📊',
  metrics: '⚡',
};

const log = {
  line(char = '─', len = 80) {
    console.log(chalk.dim(char.repeat(len)));
  },

  sectionTitle(title) {
    this.line('═');
    console.log(
      chalk.bgMagentaBright.black(` ${symbols.title} ${title} `)
    );
    this.line('═');
  },

  subSection(title, icon = symbols.info) {
    this.line('─');
    console.log(
      chalk.bold.cyan(` ${icon} ${title}`)
    );
    this.line('─');
  },

  info(msg) {
    console.log(chalk.blue(`${symbols.info} ${msg}`));
  },

  success(msg) {
    console.log(chalk.green(`${symbols.success} ${msg}`));
  },

  warn(msg) {
    console.log(chalk.keyword('orange')(`${symbols.warn} ${msg}`));
  },

  error(msg) {
    console.error(chalk.red(`${symbols.error} ${msg}`));
  },

  badge(label, value, color = chalk.cyan) {
    return chalk.bgBlackBright(
      ` ${chalk.bold(label)}: ${color(value)} `
    );
  },

  kv(label, value, color = chalk.white) {
    const key = chalk.dim(label.padEnd(22, ' '));
    return `${key} ${color(value)}`;
  },
};

/* -------------------------------------------------------------------------- */
/*                     Fetch stats for a single student                       */
/* -------------------------------------------------------------------------- */

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

  console.log(
    '\n' +
      chalk.bold(
        `${symbols.student} ${chalk.yellow(name)} ` +
          chalk.dim(`(${rollNo || 'No RollNo'})`)
      )
  );

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
      log.warn(
        `Skipping ${chalk.bold(key)} — ${chalk.dim('No identifier provided')}`
      );
      return [key, oldStats[key] || { error: 'No identifier provided' }];
    }

    try {
      const start = Date.now();
      const result = await fetchFn(value);
      const duration = Date.now() - start;

      log.success(
        `${chalk.bold(key.padEnd(10))} ` +
          chalk.green('OK') +
          chalk.dim(`  (${duration}ms)`)
      );

      return [key, result];
    } catch (err) {
      log.warn(
        `${chalk.bold(key.padEnd(10))} ` +
          chalk.red('FAILED') +
          chalk.dim(`  (${err.message})`)
      );
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

/* -------------------------------------------------------------------------- */
/*                  Main test function - Full DB batch refetch                */
/* -------------------------------------------------------------------------- */

async function testDatabaseRefetch() {
  log.sectionTitle('TESTING COMPLETE DATABASE BATCH REFETCH');
  console.log(
    '   ' +
      log.badge('Flow', 'Departments → Classes → Students', chalk.yellow) +
      '  ' +
      log.badge('Mode', 'REFETCH', chalk.green)
  );

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
    /* ---------------------------- DB Connection ---------------------------- */
    log.subSection('Connecting to MongoDB', symbols.db);
    log.info('Connecting using DB_URI from environment...');
    await mongoose.connect(process.env.DB_URI);
    log.success('Connected to MongoDB');

    /* ----------------------------- Departments ----------------------------- */
    log.subSection('Fetching departments', symbols.dept);
    const departments = await Department.find();
    globalStats.departments = departments.length;

    if (!departments || departments.length === 0) {
      log.warn('No departments found in database');
      return;
    }

    log.success(
      `Found ${chalk.bold(departments.length)} department(s)`
    );
    departments.forEach((dept, i) => {
      console.log(
        `   ${chalk.dim(String(i + 1).padStart(2, '0'))}. ` +
          `${chalk.bold(dept.name)} ` +
          chalk.gray(`(ID: ${dept._id})`)
      );
    });

    const validator = new DataValidator();

    /* ----------------------- Process each department ----------------------- */
    for (let deptIndex = 0; deptIndex < departments.length; deptIndex++) {
      const department = departments[deptIndex];
      const deptStartTime = Date.now();

      log.subSection(
        `DEPARTMENT ${deptIndex + 1}/${departments.length}: ${department.name}`,
        symbols.dept
      );

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
        log.warn(`No classes found for department ${chalk.bold(department.name)}`);
        globalStats.departmentResults.push(deptStats);
        continue;
      }

      log.info(
        `Found ${chalk.bold(classes.length)} class(es) in ${chalk.bold(
          department.name
        )}`
      );

      /* ------------------------- Process each class ------------------------ */
      for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        const classItem = classes[classIndex];
        const classStartTime = Date.now();

        console.log(
          '\n' +
            chalk.bold(
              `${symbols.cls} Class ${classIndex + 1}/${classes.length}: ` +
                `${chalk.yellow(classItem.name || classItem._id)}`
            )
        );

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
          log.warn('    No students found in this class');
          deptStats.classResults.push(classStats);
          continue;
        }

        log.info(
          `    ${symbols.student} Processing ${chalk.bold(
            students.length
          )} student(s)...`
        );

        // Initialize batch processor for this class
        const processor = new BatchProcessor({
          concurrency: 5, // Increased from 3 for faster processing
          batchSize: 12, // Increased from 8 for larger batches
          retryAttempts: 2,
          timeout: 60000,
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
              '       ' +
                chalk.bold(symbols.progress) +
                ' ' +
                log.kv('Processed', `${stats.processed}/${stats.total}`) +
                '  ' +
                log.kv(
                  'Completion',
                  `${percentage}%`,
                  percentage === '100.0'
                    ? chalk.green
                    : chalk.cyan
                ) +
                '  ' +
                log.kv('✅ Success', succeeded, chalk.green) +
                '  ' +
                log.kv('❌ Failed', failed, chalk.red)
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

        log.success(
          `    Class completed: ${chalk.bold(
            `${stats.succeeded}/${students.length}`
          )} students successful ` +
            chalk.dim(`(${(classStats.duration / 1000).toFixed(1)}s)`)
        );

        deptStats.classResults.push(classStats);
      }

      // Update department stats
      deptStats.duration = Date.now() - deptStartTime;
      globalStats.departmentResults.push(deptStats);

      const successRate =
        deptStats.totalStudents > 0
          ? ((deptStats.successfulStudents / deptStats.totalStudents) * 100).toFixed(1)
          : 0;

      console.log('\n' + chalk.bold(symbols.dept) + ' Department Summary');
      console.log(
        '  ' +
          log.kv('Name', deptStats.departmentName, chalk.yellow) +
          '\n  ' +
          log.kv(
            'Students',
            `${deptStats.successfulStudents}/${deptStats.totalStudents}`,
            chalk.green
          ) +
          '\n  ' +
          log.kv('Classes', deptStats.classes, chalk.cyan) +
          '\n  ' +
          log.kv(
            'Success Rate',
            `${successRate}%`,
            successRate >= 90 ? chalk.green : chalk.keyword('orange')
          ) +
          '\n  ' +
          log.kv(
            'Duration',
            `${(deptStats.duration / 1000).toFixed(1)}s`,
            chalk.magenta
          )
      );
    }

    const totalDuration = Date.now() - overallStartTime;

    /* ------------------------------- SUMMARY ------------------------------- */
    log.sectionTitle('COMPLETE DATABASE REFETCH RESULTS');

    console.log('\n' + chalk.bold('🎯 OVERALL SUMMARY'));
    console.log(
      '  ' +
        log.kv('Departments', globalStats.departments, chalk.yellow) +
        '\n  ' +
        log.kv('Classes', globalStats.classes, chalk.cyan) +
        '\n  ' +
        log.kv('Total Students', globalStats.totalStudents, chalk.white) +
        '\n  ' +
        log.kv('Successfully Updated', globalStats.successfulStudents, chalk.green) +
        '\n  ' +
        log.kv('Failed', globalStats.failedStudents, chalk.red) +
        '\n  ' +
        log.kv('Skipped', globalStats.skippedStudents, chalk.gray)
    );

    const successRateOverall =
      globalStats.totalStudents > 0
        ? ((globalStats.successfulStudents / globalStats.totalStudents) * 100).toFixed(1)
        : 0;

    console.log(
      '\n  ' +
        log.kv(
          'Success Rate',
          `${successRateOverall}%`,
          successRateOverall >= 90 ? chalk.green : chalk.keyword('orange')
        ) +
        '\n  ' +
        log.kv('Platforms Updated', globalStats.totalPlatformsUpdated, chalk.green) +
        '\n  ' +
        log.kv('Platform Errors', globalStats.totalPlatformErrors, chalk.red) +
        '\n  ' +
        log.kv(
          'Total Duration',
          `${(totalDuration / 1000).toFixed(2)}s (${(totalDuration / 60000).toFixed(
            2
          )} min)`,
          chalk.magenta
        )
    );

    if (globalStats.totalStudents > 0) {
      const avgPerStudent = totalDuration / globalStats.totalStudents;
      console.log(
        '  ' +
          log.kv(
            'Average per Student',
            `${avgPerStudent.toFixed(0)}ms`,
            chalk.cyan
          ) +
          '\n  ' +
          log.kv(
            'Throughput',
            `${(globalStats.totalStudents / (totalDuration / 1000)).toFixed(
              2
            )} students/sec`,
            chalk.cyan
          )
      );
    }

    /* ------------------------ Department Breakdown ------------------------ */
    console.log('\n' + chalk.bold('📋 DEPARTMENT BREAKDOWN'));
    globalStats.departmentResults.forEach((dept, i) => {
      const successRate =
        dept.totalStudents > 0
          ? ((dept.successfulStudents / dept.totalStudents) * 100).toFixed(1)
          : 0;
      console.log(
        `  ${chalk.dim(String(i + 1).padStart(2, '0'))}. ` +
          `${chalk.bold(dept.departmentName)} → ` +
          `${chalk.green(`${dept.successfulStudents}/${dept.totalStudents}`)} students ` +
          chalk.dim(
            `across ${dept.classes} classes, ${successRate}% success, ${(dept.duration /
              1000).toFixed(1)}s`
          )
      );
    });

    /* --------------------------- Validation issues ------------------------ */
    if (globalStats.validationIssues.length > 0) {
      console.log(
        '\n' +
          chalk.bold(
            `${symbols.warn} VALIDATION ISSUES (${globalStats.validationIssues.length})`
          )
      );
      const displayLimit = 10;
      globalStats.validationIssues.slice(0, displayLimit).forEach((issue, i) => {
        console.log(
          `  ${chalk.dim(String(i + 1).padStart(2, '0'))}. ` +
            `${issue.department} → ${issue.class} → ` +
            `${chalk.yellow(issue.student)} (${chalk.dim(issue.rollNo)})`
        );
        issue.errors.slice(0, 2).forEach(err =>
          console.log(`     - ${chalk.red(err)}`)
        );
      });
      if (globalStats.validationIssues.length > displayLimit) {
        console.log(
          `  ... and ${chalk.bold(
            globalStats.validationIssues.length - displayLimit
          )} more`
        );
      }
    }

    /* ----------------------------- Anomalies ------------------------------ */
    if (globalStats.anomalies.length > 0) {
      console.log(
        '\n' +
          chalk.bold(
            `${symbols.student} ANOMALIES DETECTED (${globalStats.anomalies.length})`
          )
      );
      const displayLimit = 10;
      globalStats.anomalies.slice(0, displayLimit).forEach((anomaly, i) => {
        console.log(
          `  ${chalk.dim(String(i + 1).padStart(2, '0'))}. ` +
            `${anomaly.department} → ${anomaly.class} → ` +
            `${chalk.yellow(anomaly.student)} (${chalk.dim(anomaly.rollNo)})`
        );
        const platforms = Object.keys(anomaly.anomalies);
        platforms.slice(0, 2).forEach(platform => {
          anomaly.anomalies[platform].slice(0, 1).forEach(issue => {
            console.log(
              `     ${chalk.cyan(platform)}: ${chalk.keyword('orange')(issue)}`
            );
          });
        });
      });
      if (globalStats.anomalies.length > displayLimit) {
        console.log(
          `  ... and ${chalk.bold(
            globalStats.anomalies.length - displayLimit
          )} more`
        );
      }
    }

    /* ------------------------- Performance metrics ------------------------ */
    console.log('\n' + chalk.bold(`${symbols.metrics} PERFORMANCE METRICS`));
    const avgDeptTime =
      globalStats.departments > 0 ? totalDuration / globalStats.departments : 0;
    const avgClassTime =
      globalStats.classes > 0 ? totalDuration / globalStats.classes : 0;
    const avgStudentTime =
      globalStats.totalStudents > 0 ? totalDuration / globalStats.totalStudents : 0;

    console.log(
      '  ' +
        log.kv(
          'Average per Department',
          `${(avgDeptTime / 1000).toFixed(2)}s`,
          chalk.cyan
        ) +
        '\n  ' +
        log.kv('Average per Class', `${(avgClassTime / 1000).toFixed(2)}s`, chalk.cyan) +
        '\n  ' +
        log.kv('Average per Student', `${avgStudentTime.toFixed(0)}ms`, chalk.cyan) +
        '\n  ' +
        log.kv(
          'Est. time for 1000 students',
          `${((avgStudentTime * 1000) / 60000).toFixed(2)} min`,
          chalk.magenta
        )
    );

    log.sectionTitle('COMPLETE DATABASE REFETCH SUCCESSFUL 🎉');

    return globalStats;
  } catch (error) {
    log.error('TEST FAILED');
    console.error(error);
    console.error(chalk.dim('Stack trace:'), error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    log.info('Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testDatabaseRefetch()
    .then(() => {
      log.success('All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      log.error('Test crashed');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testDatabaseRefetch };