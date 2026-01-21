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

router.get("/", getStudentsByClass);
router.get("/all", getAllStudents);
router.get("/refetch/single", refetchSingleStudent);
router.get("/refetch", refetchClassStudents);
router.get("/refetch/all", refetchAllStudents);
router.get("/get-student", getStudent);

router.post("/", addStudent);
router.post("/login", loginStudent);
router.post("/change-password", changeStudentPassword);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

module.exports = router;
