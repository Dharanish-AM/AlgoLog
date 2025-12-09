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
  year:{
    type:String,
  }
});

// Add indexes for faster queries
classSchema.index({ department: 1 }); // For department queries
classSchema.index({ section: 1, year: 1 }); // For section+year queries
classSchema.index({ department: 1, section: 1, year: 1 }); // Compound index
// Note: email index already defined with unique: true in schema

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
