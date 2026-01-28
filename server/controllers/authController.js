const Department = require("../models/departmentSchema");
const Class = require("../models/classSchema");
const Admin = require("../models/adminSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwt");
const { getLeetCodeQuestionOfToday } = require("../config/scraper");
const { ACADEMIC_YEARS } = require("../utils/constants");

exports.loginDepartment = async (req, res) => {
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
};

exports.getAllDepartments = async (req, res) => {
  try {
    const Department = require("../models/departmentSchema");
    const Class = require("../models/classSchema");

    const departments = await Department.find();

    const departmentDetails = await Promise.all(
      departments.map(async (dept) => {
        // Get classes either from dept.classes array or by department field in Class model
        let classes = await Class.find({
          _id: { $in: dept.classes },
        });

        // If no classes found via dept.classes, try finding by department ID
        if (classes.length === 0) {
          classes = await Class.find({
            department: dept._id,
          });
        }

        const uniqueSections = [...new Set(classes.map((cls) => cls.section).filter(Boolean))];

        return {
          _id: dept._id,
          name: dept.name,
          sections: uniqueSections,
        };
      })
    );

    res.status(200).json(departmentDetails);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

exports.createDepartment = async (req, res) => {
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
};

exports.getFormDetails = async (req, res) => {
  try {
    const Department = require("../models/departmentSchema");
    const Class = require("../models/classSchema");

    const departments = await Department.find();

    const departmentDetails = await Promise.all(
      departments.map(async (dept) => {
        // Get classes either from dept.classes array or by department field in Class model
        let classes = await Class.find({
          _id: { $in: dept.classes },
        });

        // If no classes found via dept.classes, try finding by department ID
        if (classes.length === 0) {
          classes = await Class.find({
            department: dept._id,
          });
        }

        const uniqueSections = [...new Set(classes.map((cls) => cls.section).filter(Boolean))];

        return {
          _id: dept._id,
          name: dept.name,
          sections: uniqueSections,
        };
      })
    );

    res.status(200).json(departmentDetails);
  } catch (err) {
    console.error("Error fetching form details:", err);
    res.status(500).json({ error: "Failed to fetch department details" });
  }
};

exports.getDailyLeetCodeProblem = async (req, res) => {
  try {
    const problem = await getLeetCodeQuestionOfToday();
    res.status(200).json({ problem });
  } catch (err) {
    console.error("Error fetching daily problem:", err);
    res.status(500).json({ error: "Failed to fetch daily problem" });
  }
};

exports.createAdmin = (req, res) => {
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
};

exports.loginAdmin = async (req, res) => {
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

    const token = await generateToken(admin.email, admin._id);
    res.status(200).json({ token, admin: adminWithoutPassword });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const adminData = await Admin.findById(req.user.id);
    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { password, ...adminWithoutPassword } = adminData.toObject();
    res.status(200).json({ admin: adminWithoutPassword });
  } catch (err) {
    console.error("Error fetching admin:", err);
    res.status(500).json({ message: "Failed to fetch admin" });
  }
};

exports.getAdminDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select("-password");
    res.status(200).json({ departments });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

exports.getAdminClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("students");

    res.status(200).json({ classes });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

// Get academic years list
exports.getAcademicYears = async (req, res) => {
  try {
    res.status(200).json({ 
      years: ACADEMIC_YEARS,
      count: ACADEMIC_YEARS.length 
    });
  } catch (err) {
    console.error("Error fetching academic years:", err);
    res.status(500).json({ error: "Failed to fetch academic years" });
  }
};
