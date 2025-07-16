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

  console.log(`\n🔍 Starting fetch for student: ${name} (${rollNo})`);

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

  const fetches = [
    {
      platform: "LeetCode",
      value: leetcode,
      isUrl: false,
      extra: {},
      fn: () => getLeetCodeStats(leetcode),
    },
    {
      platform: "HackerRank",
      value: hackerrank,
      isUrl: false,
      extra: {},
      fn: () => getHackerRankStats(hackerrank),
    },
    {
      platform: "CodeChef",
      value: codechef,
      isUrl: false,
      extra: {},
      fn: () => getCodeChefStats(codechef),
    },
    {
      platform: "GitHub",
      value: github,
      isUrl: false,
      extra: {},
      fn: () => getGithubStats(github),
    },
    {
      platform: "Codeforces",
      value: codeforces,
      isUrl: false,
      extra: {},
      fn: () => getCodeforcesStats(codeforces),
    },
    {
      platform: "Skillrack",
      value: skillrack,
      isUrl: true,
      extra: { certificates: [] },
      fn: () => getSkillrackStats(skillrack),
    },
  ];

  const results = await Promise.allSettled(
    fetches.map(({ platform, value, fn, isUrl }) => {
      if (!value || (isUrl && !value.startsWith("http"))) {
        console.warn(
          `[${platform}] ⚠️ Skipping due to invalid or missing identifier.`
        );
        return Promise.resolve({
          platform,
          status: "skipped",
          result: formatError(platform, value, {}, isUrl),
        });
      }

      return withRetry(fn, 1, platform, value)
        .then((res) => ({ platform, status: "fulfilled", result: res }))
        .catch((err) => ({
          platform,
          status: "rejected",
          result: formatError(platform, value, {}, isUrl),
        }));
    })
  );

  const stats = {};
  results.forEach((res, i) => {
    const key = fetches[i].platform.toLowerCase();
    if (res.value?.status === "skipped") {
      stats[key] = res.value.result;
    } else if (res.status === "fulfilled") {
      stats[key] = res.value.result;
    } else if (res.status === "rejected") {
      stats[key] =
        res.reason?.result ||
        formatError(fetches[i].platform, fetches[i].value);
    }
  });

  console.log(`✅ Finished fetching all platforms for: ${name} (${rollNo})`);

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats,
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

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

app.get("/api/students/refetch", async (req, res) => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const now = new Date();
  const start = Date.now();

  try {
    const { classId } = req.query;

    console.log(
      `\n🚀 Starting stats refetch for Class ID: ${classId} at ${now.toLocaleString()}`
    );

    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" });
    }

    const students = await Student.find({ classId });
    if (!students || students.length === 0) {
      console.warn("⚠️ No students found for class:", classId);
      return res.status(200).json({ students: [], count: 0 });
    }

    let updatedCount = 0;
    const failedStudents = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      console.log(
        `\n🔄 [${i + 1}/${students.length}] Fetching stats for ${
          student.name
        } (${student.rollNo})`
      );

      try {
        const updatedStats = await getStatsForStudent(student);

        await Student.findByIdAndUpdate(student._id, {
          stats: updatedStats.stats,
        });

        console.log(`✅ Updated: ${student.name}`);
        updatedCount++;
      } catch (err) {
        console.error(`🔥 Failed: ${student.name} – ${err.message}`);
        failedStudents.push({ name: student.name, rollNo: student.rollNo });
      }

      await delay(2000); // ⏳ Delay between students (API safety)
    }

    // 🗂️ Update class timestamp
    const currentClass = await Class.findByIdAndUpdate(classId, {
      studentsUpdatedAt: now,
    });

    console.log(`\n🎯 Update Summary`);
    console.log(`- ✅ Total Updated: ${updatedCount}`);
    console.log(`- ❌ Skipped: ${failedStudents.length}`);
    console.log(`- ⌛ Duration: ${(Date.now() - start) / 1000}s`);
    console.log(`📆 Completed at: ${new Date().toLocaleString()}`);

    res.status(200).json({
      count: updatedCount,
      skipped: failedStudents.length,
      failedStudents,
      updatedAt: now,
    });
  } catch (error) {
    console.error("❌ Fatal error during refetch:", error);
    res
      .status(500)
      .json({ error: "Failed to refetch stats for all students." });
  }
});

app.get("/api/students/refetch/single", async (req, res) => {
  try {
    const { id } = req.query;
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

    const updatedStats = await getStatsForStudent(student);
    const { stats } = updatedStats;

    const failedPlatforms = [];

    if (student.leetcode && !stats.leetcode?.solved?.All)
      failedPlatforms.push("leetcode");

    if (
      student.hackerrank &&
      (!Array.isArray(stats.hackerrank?.badges) ||
        stats.hackerrank.badges.length === 0)
    )
      failedPlatforms.push("hackerrank");

    if (student.codechef && !stats.codechef?.fullySolved)
      failedPlatforms.push("codechef");

    if (
      student.github &&
      (typeof stats.github !== "object" || stats.github.totalCommits == null)
    )
      failedPlatforms.push("github");

    if (
      student.codeforces &&
      !stats.codeforces?.contests &&
      !stats.codeforces?.problemsSolved
    )
      failedPlatforms.push("codeforces");

    if (
      student.skillrack &&
      (!stats.skillrack?.programsSolved || stats.skillrack.programsSolved < 1)
    )
      failedPlatforms.push("skillrack");

    if (failedPlatforms.length > 0) {
      console.warn(
        `[WARN] Incomplete stats for ${student.name}: ${failedPlatforms.join(
          ", "
        )}`
      );
    } else {
      console.log(`[SUCCESS] All stats valid for ${student.name}`);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { stats },
      { new: true }
    );

    console.log(`[DONE] Stats updated for ${student.name} (${student.rollNo})`);

    return res.status(200).json({
      student: updatedStudent,
      failedPlatforms,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("[ERROR] Failed to refetch student stats:", error.message);
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

    console.log(`🛠️ Updating student with ID: ${id}`);

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

    const stats = updatedStats?.stats || existingStudent.stats;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats,
      },
      { new: true }
    );

    console.log(`✅ Student updated: ${updatedStudent.name}`);

    res.status(200).json({
      student: updatedStudent,
    });
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

app.get("/api/student/get-student", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const name = decoded.username;
    const studentData = await Student.findOne({ name });
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

// const tmp = async()=>{
//   const students = await Student.find();
//   const pass = "sece@123"
//   for (const student of students) {
//     const hashpass = await bcrypt.hash(pass, 10);
//     student.password = hashpass;
//     await student.save();

//   }
// }

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
