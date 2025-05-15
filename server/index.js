const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/studentSchema");
const dotenv = require("dotenv");
const cron = require("node-cron");
const {
  getCodeChefStats,
  getHackerRankStats,
  getLeetCodeStats,
  getTryHackMeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
} = require("./scrapers/scraper");

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

async function getStatsForStudent(student) {
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

  const formatError = (
    platform,
    identifier,
    extraFields = {},
    isUrl = false
  ) => ({
    platform,
    updatedAt: new Date().toISOString(),
    ...extraFields,
    error: identifier
      ? isUrl
        ? identifier.startsWith("http")
          ? "Failed to fetch"
          : "Invalid URL"
        : "Failed to fetch"
      : isUrl
      ? "URL missing"
      : "Username missing",
  });

  const leetPromise = leetcode
    ? getLeetCodeStats(leetcode)
    : Promise.resolve(null);
  const hackPromise = hackerrank
    ? getHackerRankStats(hackerrank)
    : Promise.resolve(null);
  const chefPromise = codechef
    ? getCodeChefStats(codechef)
    : Promise.resolve(null);
  const githubPromise = github ? getGithubStats(github) : Promise.resolve(null);
  const cfPromise = codeforces
    ? getCodeforcesStats(codeforces)
    : Promise.resolve(null);
  const skillPromise =
    skillrack && skillrack.startsWith("http")
      ? getSkillrackStats(skillrack)
      : Promise.resolve(null);

  const [leet, hack, chef, githubResult, cf, skill] = await Promise.allSettled([
    leetPromise,
    hackPromise,
    chefPromise,
    githubPromise,
    cfPromise,
    skillPromise,
  ]);

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats: {
      leetcode:
        leet.status === "fulfilled" && leet.value
          ? leet.value
          : formatError("LeetCode", leetcode),
      hackerrank:
        hack.status === "fulfilled" && hack.value
          ? hack.value
          : formatError("HackerRank", hackerrank),
      codechef:
        chef.status === "fulfilled" && chef.value
          ? chef.value
          : formatError("CodeChef", codechef),
      codeforces:
        cf.status === "fulfilled" && cf.value
          ? cf.value
          : formatError("Codeforces", codeforces),
      skillrack:
        skill.status === "fulfilled" &&
        skill.value &&
        typeof skill.value === "object"
          ? skill.value
          : formatError("Skillrack", skillrack, { certificates: [] }, true),
      github:
        githubResult.status === "fulfilled" && githubResult.value
          ? githubResult.value
          : formatError("GitHub", github),
    },
  };
}

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find({});
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const results = students.map((student) => {
      const { stats, ...studentWithoutStats } = student.toObject();
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
  try {
    const { date } = req.query;
    console.log(date);
    const students = await Student.find({}).lean();
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [], count: 0 });
    }

    const batchSize = 10;
    const studentBatches = [];
    for (let i = 0; i < students.length; i += batchSize) {
      studentBatches.push(students.slice(i, i + batchSize));
    }

    const allUpdateOperations = [];
    let validCount = 0;

    for (const studentBatch of studentBatches) {
      const batchOperations = studentBatch.map((student, index) =>
        (async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000 * index));
          console.log("Getting stats for student:", student.name);
          return getStatsForStudent(student)
            .then((updatedStats) => {
              const { stats } = updatedStats;

              const isValidStats =
                (!student.leetcode || stats.leetcode?.solved?.All != null) &&
                (!student.hackerrank ||
                  (Array.isArray(stats.hackerrank?.badges) &&
                    stats.hackerrank.badges.length > 0)) &&
                (!student.codechef || stats.codechef?.fullySolved != null) &&
                (!student.codeforces || stats.codeforces?.contests != null) &&
                (!student.skillrack ||
                  (typeof stats.skillrack === "object" &&
                    stats.skillrack.programsSolved != null)) &&
                (!student.github ||
                  (typeof stats.github === "object" &&
                    stats.github.totalCommits != null));

              if (isValidStats) {
                console.log(
                  "Successfully fetched stats for student:",
                  student.name
                );
                validCount++;
                return {
                  updateOne: {
                    filter: { _id: student._id },
                    update: {
                      stats: updatedStats.stats,
                      updatedAt: date,
                    },
                  },
                };
              } else {
                const invalidPlatforms = [
                  !student.leetcode || stats.leetcode?.solved?.All != null
                    ? null
                    : "LeetCode",
                  !student.hackerrank ||
                  (Array.isArray(stats.hackerrank?.badges) &&
                    stats.hackerrank.badges.length > 0)
                    ? null
                    : "HackerRank",
                  !student.codechef || stats.codechef?.fullySolved != null
                    ? null
                    : "CodeChef",
                  !student.codeforces || stats.codeforces?.contests != null
                    ? null
                    : "Codeforces",
                  !student.skillrack ||
                  (typeof stats.skillrack === "object" &&
                    stats.skillrack.programsSolved != null)
                    ? null
                    : "Skillrack",
                  !student.github ||
                  (typeof stats.github === "object" &&
                    stats.github.totalCommits != null)
                    ? null
                    : "GitHub",
                ].filter(Boolean);
                console.warn(
                  `Skipping update for ${
                    student.name
                  } due to invalid stats on platforms: ${invalidPlatforms.join(
                    ", "
                  )}`
                );
                return null;
              }
            })
            .catch((err) => {
              console.error(`Error fetching stats for ${student.name}:`, err);
              return null;
            });
        })()
      );

      const batchResults = await Promise.allSettled(batchOperations);
      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          allUpdateOperations.push(result.value);
        } else if (result.status === "rejected") {
          console.error("Batch operation rejected:", result.reason);
        }
      }
    }

    if (allUpdateOperations.length > 0) {
      const bulkWriteResult = await Student.bulkWrite(allUpdateOperations);
      console.log("Bulk write result:", bulkWriteResult);
    }

    const updatedStudents = await Student.find({});
    console.log("The Valid Count is:", validCount);
    res
      .status(200)
      .json({ students: updatedStudents, count: validCount, date: date });
  } catch (error) {
    console.error("Error refetching student stats:", error);
    res.status(500).json({ error: "Failed to refetch stats for all students" });
  }
});

app.get("/api/students/refetch/single", async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const updatedStats = await getStatsForStudent(student);
    const { stats } = updatedStats;
    const isValidStats =
      (!student.leetcode || stats.leetcode?.solved?.All != null) &&
      (!student.hackerrank ||
        (Array.isArray(stats.hackerrank?.badges) &&
          stats.hackerrank.badges.length > 0)) &&
      (!student.codechef || stats.codechef?.fullySolved != null) &&
      (!student.codeforces || stats.codeforces?.contests != null) &&
      (!student.skillrack ||
        (typeof stats.skillrack === "object" &&
          stats.skillrack.programsSolved != null));
    !student.github ||
      (typeof stats.github === "object" && stats.github.totalCommits != null);

    if (isValidStats) {
      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { stats: updatedStats.stats },
        { new: true }
      );
      return res.status(200).json({ student: updatedStudent });
    } else {
      return res.status(400).json({ error: "Invalid stats data" });
    }
  } catch (error) {
    console.error("Error refetching single student stats:", error);
    res.status(500).json({ error: "Failed to refetch student stats" });
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

    console.log(req.body);

    if (!name || !email || !rollNo) {
      return res
        .status(400)
        .json({ error: "Name, email, and roll number are required" });
    }

    const studentInfo = {
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
    };

    let statsResult = { stats: {} };
    try {
      statsResult = await getStatsForStudent(studentInfo);
    } catch (err) {
      console.warn("Stats fetch failed, proceeding with empty stats:", err);
    }

    const newStudent = new Student({
      ...studentInfo,
      stats: statsResult.stats,
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
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

    console.log(`Updating student with ID: ${id}`);

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedData = {
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
    };

    const updatedStats = await getStatsForStudent({
      _id: existingStudent._id,
      ...updatedData,
    });

    const stats =
      updatedStats && updatedStats.stats
        ? updatedStats.stats
        : existingStudent.stats;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats,
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log("Updated student:", updatedStudent.name);

    res.status(200).json({
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running cron job to fetch stats...");
//   const students = await Student.find();
//   for (const student of students) {
//     const stats = await getStatsForStudent(student);
//     await Student.findByIdAndUpdate(student._id, { stats });
//   }
// });

// const skillrackUrl =
//   "https://www.skillrack.com/faces/resume.xhtml?id=484181&key=761fea3322a6375533ddd850099a73a57d20956a";
// getSkillrackStats(skillrackUrl).then(console.log);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
