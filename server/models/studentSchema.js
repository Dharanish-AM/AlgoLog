const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
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
    skillrack: { type: String, required: true },
    stats: {
      leetcode: {
        platform: String,
        solved: {
          All: Number,
          Easy: Number,
          Medium: Number,
          Hard: Number,
        },
        rating: String,
      },
      hackerrank: {
        platform: String,
        badges: [
          {
            name: String,
            stars: Number,
          },
        ],
      },
      codechef: {
        platform: String,
        rating: String,
        fullySolved: Number,
      },
      codeforces: {
        platform: String,
        rating: mongoose.Schema.Types.Mixed,
        rank: String,
        maxRating: mongoose.Schema.Types.Mixed,
        contests: Number,
        problemsSolved: Number,
      },
      skillrack: {
        platform: String,
        rank: Number,
        programsSolved: Number,
        languages: {
          JAVA: Number,
          C: Number,
          SQL: Number,
          PYTHON3: Number,
          CPP: Number,
        },
        certificates: [
          {
            title: String,
            date: String,
            link: String,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
