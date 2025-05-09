const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  year: { type: String, required: true },
  leetcode: { type: String, required: true },
  hackerrank: { type: String, required: true },
  codechef: { type: String, required: true },
  codeforces: { type: String, required: true },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;