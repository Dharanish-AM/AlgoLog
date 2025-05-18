const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Student",
  },
  lastUpdated: {
    type: Date,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  section: {
    type: String,
    enum: ["A", "B", "C", "D"],
  },
  studentsUpdatedAt: {
    type: Date,
  },
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
