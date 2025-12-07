const express = require("express");
const router = express.Router();
const {
  getStudentsByClass,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  refetchSingleStudent,
  refetchClassStudents,
  refetchAllStudents,
  getStudent,
  loginStudent,
  changeStudentPassword,
} = require("../controllers/studentController");

// GET routes
router.get("/", getStudentsByClass);
router.get("/all", getAllStudents);
router.get("/refetch/single", refetchSingleStudent);
router.get("/refetch", refetchClassStudents);
router.get("/refetch/all", refetchAllStudents);
router.get("/get-student", getStudent);

// POST routes
router.post("/", addStudent);
router.post("/login", loginStudent);
router.post("/change-password", changeStudentPassword);

// PUT routes
router.put("/:id", updateStudent);

// DELETE routes
router.delete("/:id", deleteStudent);

module.exports = router;
