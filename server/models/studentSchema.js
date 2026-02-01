const mongoose = require("mongoose");
const {
  DEPARTMENTS,
  SECTIONS,
  YEARS,
  ACCOMMODATION_TYPES,
  GENDERS,
  INTERESTS,
} = require("../utils/constants");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    rollNo: { type: String, required: true },
    password: { type: String, required: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    section: { type: String, enum: SECTIONS, required: true },
    year: { type: String, enum: YEARS, required: true },
    accommodation: {
      type: String,
      enum: ACCOMMODATION_TYPES,
      default: "Day Scholar",
      required: true,
    },
    gender: { type: String, enum: GENDERS, required: true },
    interest: {
      type: String,
      enum: INTERESTS,
      default: "IT",
      required: true,
    },
    leetcode: { type: String, required: true },
    hackerrank: { type: String, required: true },
    codechef: { type: String, required: true },
    codeforces: { type: String, required: true },
    skillrack: { type: String, required: true },
    github: { type: String, required: true },
    stats: {
      leetcode: {
        platform: String,
        solved: {
          All: Number,
          Easy: Number,
          Medium: Number,
          Hard: Number,
        },
        rating: Number,
        globalRanking: Number,
        contestCount: Number,
        topPercentage: Number,
        badges: [
          {
            id: String,
            name: String,
            shortName: String,
            displayName: String,
            icon: String,
            hoverText: String,
            category: String,
            creationDate: String,
          },
        ],
        contests: [
          {
            title: String,
            startTime: Number,
            rating: Number,
            ranking: Number,
            problemsSolved: Number,
            totalProblems: Number,
            trendDirection: String,
            finishTimeInSeconds: Number,
          },
        ],
        topicStats: [
          {
            tagName: { type: String },
            problemsSolved: { type: Number, default: 0 },
          },
        ],
        languageStats: [
          {
            languageName: String,
            problemsSolved: Number,
          },
        ],
        streak: { type: Number, default: 0 },
        totalActiveDays: { type: Number, default: 0 },
        activeYears: [String],
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
        username: String,
        rating: Number,
        division: String,
        stars: String,
        highestRating: Number,
        globalRank: Number,
        countryRank: Number,
        fullySolved: Number,
        updatedAt: Date,
      },
      codeforces: {
        platform: String,
        rating: Number,
        rank: String,
        maxRating: Number,
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
      github: {
        platform: String,
        totalCommits: Number,
        totalRepos: Number,
        longestStreak: Number,
        currentStreak: Number,
        topLanguages: [
          {
            name: String,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for faster queries
studentSchema.index({ department: 1 }); // For department queries
studentSchema.index({ department: 1, section: 1, year: 1 }); // Compound index for class lookup
studentSchema.index({ email: 1 }, { unique: true }); // Unique email
studentSchema.index({ rollNo: 1 }, { unique: true }); // Unique rollNo
studentSchema.index({ updatedAt: -1 }); // For sorting by recent updates

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
