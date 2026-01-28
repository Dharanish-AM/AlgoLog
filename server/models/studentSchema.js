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
        rating: mongoose.Schema.Types.Mixed,
        division: String,
        stars: String,
        highestRating: mongoose.Schema.Types.Mixed,
        globalRank: mongoose.Schema.Types.Mixed,
        countryRank: mongoose.Schema.Types.Mixed,
        fullySolved: Number,
        updatedAt: Date,
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
        rank: mongoose.Schema.Types.Mixed,
        programsSolved: mongoose.Schema.Types.Mixed,
        languages: {
          JAVA: mongoose.Schema.Types.Mixed,
          C: mongoose.Schema.Types.Mixed,
          SQL: mongoose.Schema.Types.Mixed,
          PYTHON3: mongoose.Schema.Types.Mixed,
          CPP: mongoose.Schema.Types.Mixed,
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
