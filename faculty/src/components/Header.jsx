import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../../faculty/algolog.png";
import {
  BarChart,
  Code,
  Download,
  LayoutDashboard,
  Loader,
  LogOut,
  Search,
  Upload,
  UserPlus,
  User,
  X,
  Edit,
  Eye,
  LogOutIcon,
} from "lucide-react";
import Papa from "papaparse";
import ThemeToggle from "./ThemeToggle";
import { useLocation, useNavigate } from "react-router-dom";
import { addStudent, refetchStudents } from "../services/studentOperations";
import { GridLoader, MoonLoader } from "react-spinners";
import AddStudentModal from "./AddStudentModal";
import toast from "react-hot-toast";
import Profile from "./Profile";

export default function Header() {
  const students = useSelector((state) => state.students.students);
  const classUser = useSelector((state) => state.auth.class);
  const navigation = useNavigate();
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const response = await refetchStudents(classUser._id, token, dispatch);
      if (response.status === 200) {
        toast.success(
          `${response.data.count} Students Refreshed Successfully!`
        );
      } else {
        toast.error("Failed to refresh data.");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setLoading(false);
    }
  };

  const handleAddStudent = async (newStudent) => {
    setAddLoading(true);
    console.log("newStudent, ", newStudent);
    try {
      const response = await addStudent(newStudent, token, dispatch);
      if (response?.status === 200 || response?.status === 201) {
        setIsAddModalOpen(false);
        toast.success("Student added successfully!");
      } else {
        toast.error("Failed to add student.");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      toast.error("Failed to add student.", err);
    } finally {
      setAddLoading(false);
    }
  };

  const handleExportCSV = () => {
    const sortedStudents = [...students].sort((a, b) =>
      a.rollNo.localeCompare(b.rollNo)
    );

    const csv = Papa.unparse(
      sortedStudents.map((student) => {
        const department =
          typeof student.department?.name === "string"
            ? student.department.name
            : student.department?.name || "N/A";

        const section =
          typeof student.section === "string"
            ? student.section
            : String(student.section || "N/A");

        const year =
          typeof student.year === "string"
            ? student.year
            : String(student.year || "N/A");

        // Skillrack certificates count
        const skillrackCertCount = (student.stats.skillrack?.certificates || []).length;

        // Leetcode contest count
        const leetcodeContestCount = (student.stats.leetcode?.contests || []).length;

        return {
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          department,
          year,
          section,
          leetcode_total: student.stats.leetcode?.solved?.All || 0,
          leetcode_easy: student.stats.leetcode?.solved?.Easy || 0,
          leetcode_medium: student.stats.leetcode?.solved?.Medium || 0,
          leetcode_hard: student.stats.leetcode?.solved?.Hard || 0,
          leetcode_rating: parseFloat(student.stats.leetcode?.rating || 0).toFixed(2),
          leetcode_contest_count: leetcodeContestCount,
          hackerrank_badge_count: student.stats.hackerrank?.badges?.length || 0,
          codechef_rating: student.stats.codechef?.rating || 0,
          codechef_solved: student.stats.codechef?.fullySolved || 0,
          codeforces_rating: student.stats.codeforces?.rating || 0,
          codeforces_rank: student.stats.codeforces?.rank || "N/A",
          codeforces_max_rating: student.stats.codeforces?.maxRating || "N/A",
          codeforces_contests: student.stats.codeforces?.contests || 0,
          codeforces_solved: student.stats.codeforces?.problemsSolved || 0,
          skillrack_solved: student.stats.skillrack?.programsSolved || 0,
          skillrack_rank: student.stats.skillrack?.rank || "N/A",
          skillrack_certificates_count: skillrackCertCount,
          github_commits: student.stats.github?.totalCommits || 0,
          github_repos: student.stats.github?.totalRepos || 0
        };
      })
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.csv";
    link.click();
    toast.success("CSV exported successfully!");
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br z-50 absolute inset-0 from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      {addLoading && (
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-50">
          <MoonLoader color="#C084FC" size={40} />
        </div>
      )}
      <div
        onClick={() => {
          window.location.reload();
        }}
        className="flex cursor-pointer items-center"
      >
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-10 h-10 aspect-square"
        />
        <h1 className="ml-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
          AlgoLog
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last Updated:{" "}
          {classUser
            ? new Date(classUser.studentsUpdatedAt).toLocaleString("en-US", {
                weekday: "short", // e.g. 'Tue'
                year: "numeric",
                month: "short", // e.g. 'May'
                day: "numeric", // e.g. '11'
                hour: "numeric", // e.g. '1'
                minute: "numeric", // e.g. '30'
                second: "numeric", // e.g. '45'
                hour12: true, // 12-hour time format
              })
            : "N/A"}
        </div>
        <button
          onClick={handleRefreshData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12a7.5 7.5 0 0113.148-5.289m0 0H14.25m3.398 0v3.398M19.5 12a7.5 7.5 0 01-13.148 5.289m0 0H9.75m-3.398 0v-3.398"
            />
          </svg>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Refresh
          </span>
        </button>
        <button
          onClick={() => {
            if (location.pathname === "/chart") {
              navigation("/");
            } else {
              navigation("/chart");
            }
          }}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {location.pathname === "/" ? (
            <>
              <BarChart className="w-5 h-5 text-gray-800 dark:text-gray-100" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                View Chart
              </span>
            </>
          ) : location.pathname === "/chart" ? (
            <>
              <LayoutDashboard className="w-5 h-5 text-gray-800 dark:text-gray-100" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                View Dashboard
              </span>
            </>
          ) : (
            <>
              <LayoutDashboard className="w-5 h-5 text-gray-800 dark:text-gray-100" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                View Dashboard
              </span>
            </>
          )}
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <UserPlus
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Add Student
          </span>
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700"
        >
          <Download className="dark:text-gray-100 text-gray-800" size={18} />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Export CSV
          </span>
        </button>
        {/* <ThemeToggle /> */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex border ml-3 border-gray-500 items-center gap-2 p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <User size={"1.5rem"} className="text-gray-400 dark:text-gray-300" />
        </button>
      </div>
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />
      {isProfileModalOpen && (
        <Profile onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
}
