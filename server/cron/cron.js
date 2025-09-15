const cron = require("node-cron");
const mongoose = require("mongoose");
const Department = require("../models/departmentSchema");
const Class = require("../models/classSchema");
const Student = require("../models/studentSchema");
const { getStatsForStudent } = require("../index"); 


mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("✅ Cron connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error in cron:", err));


async function processInBatches(items, batchSize, handler) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(handler));
  }
}

async function refetchAllStats() {
  console.log(`\n🚀 CRON JOB STARTED: ${new Date().toLocaleString()}`);

  try {
    const departments = await Department.find().populate({
      path: "classes",
      populate: {
        path: "students",
        model: "Student",
      },
    });

    for (const dept of departments) {
      console.log(`\n🏫 Department: ${dept.name}`);

      for (const cls of dept.classes) {
        console.log(
          `  📚 Class: ${cls.section} (${cls.year}) - ${cls.students.length} students`
        );

        await processInBatches(cls.students, 5, async (student) => {
          try {
            const updatedStats = await getStatsForStudent(
              student,
              student.stats || {}
            );
            const mergedStats = { ...student.stats };

            for (const [platform, platformStats] of Object.entries(
              updatedStats.stats
            )) {
              if (!platformStats.error) {
                mergedStats[platform] = platformStats;
              }
            }

            await Student.findByIdAndUpdate(student._id, {
              stats: mergedStats,
            });
            console.log(`    ✅ Updated ${student.name} (${student.rollNo})`);
          } catch (err) {
            console.warn(
              `    ❌ Failed ${student.name} (${student.rollNo}): ${err.message}`
            );
          }
        });

        await Class.findByIdAndUpdate(cls._id, {
          studentsUpdatedAt: new Date(),
        });
      }
    }

    console.log(`\n🎯 CRON JOB COMPLETED at ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error("🔥 Fatal error in CRON job:", err.message);
  }
}


cron.schedule("0 0 * * *", refetchAllStats);

module.exports = { refetchAllStats };
