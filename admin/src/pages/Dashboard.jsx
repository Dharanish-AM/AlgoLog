/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Header from "../components/Header";
import {
  getAllContests,
  getAllStudents,
  getClasses,
  getDepartments,
  refetchSingleStudent,
} from "../services/adminOperations";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import StudentTable from "../components/StudentTable";
import DepartmentsList from "../components/DepartmentsList";
import ClassesList from "../components/ClassesList";
import toast from "react-hot-toast";

export default function Dashboard() {
  const departments = useSelector((state) => state.admin.departments);
  const classes = useSelector((state) => state.admin.classes);
  const [selectedDepartment, setSelectedDepartment] = React.useState("");
  const [selectedDepartmentName, setSelectedDepartmentName] =
    React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("");
  const token = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    fetchDepartments();
    fetchClasses();
  }, []);

  useEffect(() => {
    dispatch({
      type: "SET_CURRENT_DEPARTMENT",
      payload: selectedDepartment,
    });
  }, [selectedDepartment]);

  useEffect(() => {
    dispatch({
      type: "SET_CURRENT_CLASS",
      payload: selectedClass,
    });
  }, [selectedClass]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllStudents(token, dispatch);

        await getAllContests(token, dispatch);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token]);

  const handleRefetchSingleStudent = async (studentId) => {
    try {
      const response = await refetchSingleStudent(studentId, token, dispatch);
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Student Refetch successfully!");
      } else {
        toast.error("Failed to Refetch student.");
      }
    } catch (error) {
      console.error("Error fetching single student data:", error);
    }
  };

  const fetchClasses = async () => {
    await getClasses(token, dispatch);
  };

  const fetchDepartments = async () => {
    await getDepartments(token, dispatch);
  };

  

  const handleDepartmentClick = (deptId, deptName) => {
    setSelectedDepartment(deptId);
    setSelectedDepartmentName(deptName);
  };

  return (
    <div className="min-h-screen p-8  scrollbar-hide bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      <div className="mt-8">
        {!selectedDepartment && (
          <DepartmentsList
            departments={departments}
            handleDepartmentClick={handleDepartmentClick}
          />
        )}
        {selectedDepartment && !selectedClass && (
          <ClassesList
            departmentId={selectedDepartment}
            departmentName={selectedDepartmentName}
            classes={classes}
            setSelectedClass={setSelectedClass}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedDepartmentName={setSelectedDepartmentName}
          />
        )}
      </div>
      {selectedClass && (
        <div>
          <div className="flex items-center mb-6">
            <ArrowLeft
              onClick={() => {
                setSelectedClass("");
              }}
              size={26}
              className="block cursor-pointer mr-2 text-gray-500 dark:text-gray-400"
            />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDepartmentName} - {selectedClass.username}
            </p>
          </div>
          <StudentTable
            handleRefetchSingleStudent={handleRefetchSingleStudent}
            students={selectedClass.students}
          />
        </div>
      )}
    </div>
  );
}
