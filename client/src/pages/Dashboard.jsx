import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar.jsx";
import StudentTable from "../components/StudentTable.jsx";
import StudentCard from "../components/StudentCard.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import AddStudentModal from "../components/AddStudentModal.jsx";
import { Code, Download, Loader, Search, Upload, UserPlus, LogOut } from "lucide-react";
import axios from "axios";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { GridLoader, MoonLoader } from "react-spinners";
import logo from "../../../client/algolog.png";
import {
  addStudent,
  getStudents,
  refetchSingleStudent,
  refetchStudents,
} from "../services/studentOperations.js";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header.jsx";

const Dashboard = () => {
  const students = useSelector((state) => state.students.students);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [showTopPerformer, setShowTopPerformer] = useState(false);
  const token = localStorage.getItem("token");
  const classUser = useSelector((state) => state.auth.class);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const students = await getStudents(classUser._id,token, dispatch);
      setTotalCount(students ? students.length : 0);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to fetch student data. Please try again later.");
      setLoading(false);
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
    const getScore = (student) => {
      const stats = student.stats?.[selectedPlatform.toLowerCase()];
      if (!stats) return -1;

      switch (selectedPlatform.toLowerCase()) {
        case "leetcode":
          return stats.solved?.All || 0;
        case "hackerrank":
          return stats.badges?.length || 0;
        case "codechef":
          return stats?.fullySolved || 0;
        case "codeforces":
          return stats?.problemsSolved || 0;
        case "skillrack":
          return stats?.programsSolved || 0;
        case "github":
          return stats?.totalCommits || 0;
        default:
          return 0;
      }
    };

    const getTotalScore = (student) => {
      const platforms = [
        "leetcode",
        "hackerrank",
        "codechef",
        "codeforces",
        "skillrack",
        "github",
      ];
      return platforms.reduce((total, platform) => {
        const stats = student.stats?.[platform];
        switch (platform) {
          case "leetcode":
            return total + (stats?.solved?.All || 0);
          case "hackerrank":
            return total + (stats?.badges?.length || 0);
          case "codechef":
            return total + (stats?.fullySolved || 0);
          case "codeforces":
            return total + (stats?.problemsSolved || 0);
          case "skillrack":
            return total + (stats?.programsSolved || 0);
          case "github":
            return total + (stats?.totalCommits || 0);
          default:
            return total;
        }
      }, 0);
    };

    let result = students ? [...students] : [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase()?.includes(term) ||
          student.rollNo?.toLowerCase()?.includes(term)
      );
    }

    if (showTopPerformer) {
      result = result
        .filter((student) => getTotalScore(student) > 0)
        .sort((a, b) => {
          const scoreDiff = getTotalScore(b) - getTotalScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          const nameA = a.name?.toLowerCase() || "";
          const nameB = b.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        });
    } else {
      result.sort((a, b) => {
        if (selectedPlatform !== "all") {
          const scoreDiff = getScore(b) - getScore(a);
          if (scoreDiff !== 0) return scoreDiff;
        }
        return a.rollNo?.localeCompare(b.rollNo || "");
      });
    }

    setFilteredStudents(result);

    if (selectedStudent && !result.find((s) => s._id === selectedStudent._id)) {
      setSelectedStudent(null);
    }
  }, [
    students,
    searchTerm,
    selectedStudent,
    selectedPlatform,
    showTopPerformer,
  ]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen scrollbar-hide bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {addLoading && (
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-50">
          <MoonLoader color="#C084FC" size={40} />
        </div>
      )}
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 justify-center border dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm px-10 py-4">
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
          />
        </div>

        <div className="space-y-6">
          {filteredStudents && filteredStudents.length > 0 ? (
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
            <div className="text-center text-m italic text-gray-500">
              No students found
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <StudentCard
              onClose={() => setSelectedStudent(null)}
              student={selectedStudent}
              reFetchStudents={fetchData}
              setEditLoading={(e) => {
                setAddLoading(e);
              }}
            />
          </div>
        )}

        <footer className="fixed bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-xl shadow-md backdrop-blur-sm">
          Made by{" "}
          <a
            href="https://github.com/Dharanish-AM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-purple-400 hover:underline"
          >
            @dharanisham
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
