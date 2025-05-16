const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String },
  classes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Class",
  },
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
