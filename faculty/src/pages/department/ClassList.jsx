import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StudentTable from "../../components/StudentTable";
import StudentCard from "../../components/StudentCard";
import { handleGetUser } from "../../services/authOperations";
import Header from "./Header";
import SearchBar from "../../components/SearchBar";
import { refetchSingleStudent } from "../../services/studentOperations";
import { ArrowLeft } from "lucide-react";

export default function ClassList() {
  const classId = window.location.pathname;
  const department = useSelector((state) => state.auth.department);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const [selectedClass, setSelectedClass] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [showTopPerformer, setShowTopPerformer] = useState(false);

  const fetchData = async () => {
    if (!department) {
      const res = await handleGetUser(token);
      if (res) {
        console.log(res);
        dispatch({
          type: "SET_AUTH",
          payload: {
            token: token,
            department: res.user,
            isAuthenticated: true,
            role: res.role,
          },
        });
      }
    }
    const id = classId.split("/").pop();
    console.log("Class ID from URL:", id);
    console.log("Department:", department);

    const targetClass = department.classes.find((c) => c._id === id);

    if (targetClass) {
      setSelectedClass(targetClass);
      console.log("Target Students:", targetClass.students);
      const sortedStudents = [...(targetClass.students || [])].sort((a, b) =>
        a.rollNo.localeCompare(b.rollNo)
      );
      setFilteredStudents(sortedStudents);
      setTotalCount(sortedStudents.length);
    } else {
      setError("Class not found.");
      setFilteredStudents([]);
    }
  };

  const handleRefetchSingleStudent = async (studentId) => {
    try {
      const reponse = await refetchSingleStudent(studentId, token, dispatch);
      if (reponse?.status === 200 || reponse?.status === 201) {
        toast.success("Student Refetched successfully!");
        const updatedStudent = Response.student;
        if (selectedStudent?._id === updatedStudent._id) {
          setSelectedStudent(updatedStudent);
        }
      } else {
        toast.error("Failed to Refetch student.");
      }
    } catch (error) {
      console.error("Error fetching single student data:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!department) {
        const res = await handleGetUser(token);
        if (res) {
          dispatch({
            type: "SET_AUTH",
            payload: {
              token: token,
              department: res.user,
              isAuthenticated: true,
              role: res.role,
            },
          });
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (department) fetchData();
  }, [department]);

  useEffect(() => {
    if (selectedClass) {
      const searchFiltered = selectedClass.students
        .filter(
          (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
      setFilteredStudents(searchFiltered);
      setTotalCount(searchFiltered.length);
    }
  }, [searchTerm, selectedClass]);

  return (
    <div className="min-h-screen scrollbar-hide bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Header />
          <div
            onClick={() => window.history.back()}
            className="mb-4 cursor-pointer inline-flex gap-2 items-center px-4 py-2 text-xl font-medium text-white  focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft size={"1.5rem"} />
             Back to Classes
          </div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 mr-2 justify-center border dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm px-10 py-4">
            <span className="dark:text-gray-100 item-center flex-shrink-0 justify-center text-sm">
              Total Students:{" "}
            </span>
            <span className="text-sm dark:text-gray-100">{totalCount}</span>
          </div>
          <SearchBar
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            onShowTopPerformer={() => {
              setShowTopPerformer((prev) => !prev);
            }}
            isTopPerformer={showTopPerformer}
          />
        </div>
        <div className="space-y-6">
          {filteredStudents.length > 0 && selectedClass ? (
            <StudentTable
              students={filteredStudents}
              loading={loading}
              error={error}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              isShowTopPerformer={showTopPerformer}
              selectedPlatform={selectedPlatform}
              handleRefetchSingleStudent={handleRefetchSingleStudent}
            />
          ) : (
            <div className="text-center text-gray-500">
              No Students Data Found!
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <StudentCard
              onClose={() => setSelectedStudent(null)}
              student={selectedStudent}
              reFetchStudents={fetchData}
              setEditLoading={(e) => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
