const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    titleSlug: {
      type: String,
      required: true,
      unique: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries
contestSchema.index({ titleSlug: 1 });
contestSchema.index({ startTime: -1 });

const Contest = mongoose.model("Contest", contestSchema);

module.exports = Contest;
