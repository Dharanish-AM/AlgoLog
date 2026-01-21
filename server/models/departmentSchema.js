const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String },
  classes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Class",
  },
  password:{
    type:String
  }
});

// Add indexes for faster queries
departmentSchema.index({ name: 1 }, { unique: true }); // For name queries with uniqueness

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
