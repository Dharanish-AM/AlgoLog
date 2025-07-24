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
        const updatedStats = await getStatsForStudent(student, student.stats);

        // Only overwrite platforms whose stats did not have an error
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
        console.log(`✅ Updated: ${student.name}`);
        updatedCount++;
      } catch (err) {
        console.error(`🔥 Failed: ${student.name} – ${err.message}`);
        failedStudents.push({ name: student.name, rollNo: student.rollNo });
      }
    }
    const currentClass = await Class.findByIdAndUpdate(classId, {
      studentsUpdatedAt: now,
    });

    console.log(`\n🎯 Update Summary`);
    console.log(`- ✅ Total Updated: ${updatedCount}`);
    console.log(`- ❌ Skipped: ${failedStudents.length}`);
    console.log(
      `- ⌛ Duration: ${((Date.now() - start) / 60000).toFixed(2)} mins`
    );
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

    const updatedStats = await getStatsForStudent(student, student.stats);
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

    const mergedStats = { ...student.stats };
    for (const [platform, platformStats] of Object.entries(stats)) {
      if (!platformStats.error) {
        mergedStats[platform] = platformStats;
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { stats: mergedStats },
      { new: true }
    );

    const newStudentData = await Student.findById(id).populate("department");

    console.log(`[DONE] Stats updated for ${student.name} (${student.rollNo})`);

    return res.status(200).json({
      student: newStudentData,
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

    const departmentData = await Department.findById(department);
    if (!departmentData) {
      return res
        .status(404)
        .json({ error: "Department not found with given details" });
    }

    studentInfo.department = departmentData._id;

    const classData = await Class.findOne({ section, year, department });
    if (!classData) {
      return res
        .status(404)
        .json({ error: "Class not found with given details" });
    }
    studentInfo.classId = classData._id;

    const password = "sece@123";
    const hashPass = await bcrypt.hash(password, 10);
    studentInfo.password = hashPass;

    let statsResult = { stats: {} };
    try {
      statsResult = await getStatsForStudent(studentInfo, studentInfo.stats);
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

    const updatedStats = await getStatsForStudent(
      {
        _id: existingStudent._id,
        ...updatedData,
      },
      existingStudent.stats || {}
    );

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

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running cron job to fetch stats...");
//   const students = await Student.find();
//   for (const student of students) {
//     const stats = await getStatsForStudent(student);
//     await Student.findByIdAndUpdate(student._id, { stats });
//   }
// });

// const tmp = async () => {
//   try {
//     console.log("Starting . . .");
//     const students = await Student.find();
//     const pass = "sece@123";
//     for (const student of students) {
//       const hashpass = await bcrypt.hash(pass, 10);
//       student.password = hashpass;
//       await student.save();
//     }
//     console.log("Done . . .");
//   } catch (err) {
//     console.log(err);
//   }
// };

// const tmp = async () => {
//   console.log("Start");
//   const students = await Student.find();
//   for (const s of students) {
//     s.department = "6827032ce9f5d67cac7685e9";
//     await s.save();
//   }
//   console.log("End");
// };

// tmp();

// const temp = async()=>{
//   console.log("START")
//   const departments = await Department.find()
//   const pass = "cse@123"
//   const hashPass = await bcrypt.hash(pass,10)

//   departments.forEach(async(d)=>{
//     d.password = hashPass
//     await d.save()
//   })
//   console.log("END")
// }

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
