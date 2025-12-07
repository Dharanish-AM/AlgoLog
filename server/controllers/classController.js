const Class = require("../models/classSchema");
const Department = require("../models/departmentSchema");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

// Class login
exports.loginClass = async (req, res) => {
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
};

// Register class
exports.registerClass = async (req, res) => {
  try {
    const { password, email, departmentId, section, year } = req.body;

    if (!password || !email || !departmentId || !year) {
      return res.status(400).json({
        message: "Password, email, department, and year are required",
      });
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
};

// Change class password
exports.changeClassPassword = async (req, res) => {
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
};

// Update class
exports.updateClass = async (req, res) => {
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
};
