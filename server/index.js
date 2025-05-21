const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/studentSchema");
const dotenv = require("dotenv");
const cron = require("node-cron");
const Class = require("./models/classSchema");
const Admin = require("./models/adminSchema");
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
} = require("./scrapers/scraper");
const { generateToken } = require("./utils/jwt");
const Department = require("./models/departmentSchema");

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

// Retry helper for scraper calls
async function withRetry(promiseFn, retries = 1) {
  try {
    return await promiseFn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying due to error:", err.message);
      return withRetry(promiseFn, retries - 1);
    }
    throw err;
  }
}

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

  // Wrap each scraper call with retry
  const leetPromise = leetcode
    ? withRetry(() => getLeetCodeStats(leetcode))
    : Promise.resolve(null);
  const hackPromise = hackerrank
    ? withRetry(() => getHackerRankStats(hackerrank))
    : Promise.resolve(null);
  const chefPromise = codechef
    ? withRetry(() => getCodeChefStats(codechef))
    : Promise.resolve(null);
  const githubPromise = github
    ? withRetry(() => getGithubStats(github))
    : Promise.resolve(null);
  const cfPromise = codeforces
    ? withRetry(() => getCodeforcesStats(codeforces))
    : Promise.resolve(null);
  const skillPromise =
    skillrack && skillrack.startsWith("http")
      ? withRetry(() => getSkillrackStats(skillrack))
      : Promise.resolve(null);

  const results = await Promise.allSettled([
    leetPromise,
    hackPromise,
    chefPromise,
    githubPromise,
    cfPromise,
    skillPromise,
  ]);

  // Log individual failures
  const platforms = [
    "LeetCode",
    "HackerRank",
    "CodeChef",
    "GitHub",
    "Codeforces",
    "Skillrack",
  ];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(`Failed to fetch ${platforms[index]} stats:`, result.reason);
    }
  });

  const [
    leetResult,
    hackResult,
    chefResult,
    githubResult,
    cfResult,
    skillResult,
  ] = results;

  const leet = leetResult.status === "fulfilled" ? leetResult.value : null;
  const hack = hackResult.status === "fulfilled" ? hackResult.value : null;
  const chef = chefResult.status === "fulfilled" ? chefResult.value : null;
  const githubStats =
    githubResult.status === "fulfilled" ? githubResult.value : null;
  const cf = cfResult.status === "fulfilled" ? cfResult.value : null;
  const skill = skillResult.status === "fulfilled" ? skillResult.value : null;

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats: {
      leetcode: leet || formatError("LeetCode", leetcode),
      hackerrank: hack || formatError("HackerRank", hackerrank),
      codechef: chef || formatError("CodeChef", codechef),
      codeforces: cf || formatError("Codeforces", codeforces),
      skillrack:
        skill ||
        formatError("Skillrack", skillrack, { certificates: [] }, true),
      github: githubStats || formatError("GitHub", github),
    },
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
    }).lean();
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
  try {
    const classId = req.query.classId;
    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" });
    }
    const students = await Student.find({
      classId,
    }).lean();
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
                  Array.isArray(stats.hackerrank?.badges)) &&
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

    const currentClass = await Class.findOne({ _id: classId });
    const currentDate = new Date();
    currentClass.studentsUpdatedAt = currentDate;
    await currentClass.save();

    console.log("The Valid Count is:", validCount);
    res.status(200).json({ count: validCount, date: currentDate });
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
      (!student.hackerrank || Array.isArray(stats.hackerrank?.badges)) &&
      (!student.codechef || stats.codechef?.fullySolved != null) &&
      (!student.codeforces || stats.codeforces?.contests != null) &&
      (!student.skillrack ||
        (typeof stats.skillrack === "object" &&
          stats.skillrack.programsSolved != null)) &&
      (!student.github ||
        (typeof stats.github === "object" &&
          stats.github.totalCommits != null));

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
      classId,
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
      classId,
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
      classId,
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
      classId,
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

app.post("/api/class/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Populate department field
    const currentClass = await Class.findOne({ username }).populate(
      "department"
    );
    if (!currentClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isPasswordMatch = bcrypt.compare(password, currentClass.password);
    if (!isPasswordMatch) {
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

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: "Department already exists" });
    }

    const newDepartment = new Department({ name, classes: [] });
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

app.post("/api/class/check-token", async (req, res) => {
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

app.get("/api/class/get-class", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const username = decoded.username;
    const classData = await Class.findOne({ username }).populate("department");
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    const { password, ...classWithoutPassword } = classData.toObject();
    res.status(200).json({ class: classWithoutPassword });
  } catch (err) {
    console.error("Error fetching class:", err);
    res.status(500).json({ message: "Failed to fetch class" });
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
    const departments = await Department.find();
    res.status(200).json({ departments });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

app.get("/api/admin/get-classes", async (req, res) => {
  try {
    const classes = await Class.find().populate("students");
    res.status(200).json({ classes });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
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
