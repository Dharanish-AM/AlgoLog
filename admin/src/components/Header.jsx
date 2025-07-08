import React, { useEffect } from "react";
import logo from "../assets/algolog.png";
import { UserPlus, Download, User, ChartBar, School, Plus } from "lucide-react";
import Profile from "./Profile";
import AddDepartment from "./AddDepartment";
import AddClass from "./AddClass";
import { useLocation, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import toast from "react-hot-toast"

export default function Header({}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const departments = useSelector((state) => state.admin.departments);
  const classes = useSelector((state) => state.admin.classes);
  const currentDepartment = useSelector(
    (state) => state.admin.currentDepartment
  );
  const currentClass = useSelector((state) => state.admin.currentClass);
  const currentYear = useSelector((state)=> state.admin.currentYear)
  const navigation = useNavigate();
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] =
    React.useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = React.useState(false);
  const location = useLocation();


  const handleExportCSV = (scope = "department") => {
    let filteredStudents = [];

    if (scope === "department" && currentDepartment) {
      const deptClasses = classes.filter(
        (cls) => cls.department === currentDepartment
      );
      filteredStudents = deptClasses.flatMap((cls) => cls.students || []);
    } else if (scope === "class" && currentClass) {
      filteredStudents = currentClass.students || [];
    } else {
      toast.error("Invalid scope or selection");
      return;
    }

    if (currentYear && currentYear !== "all") {
      filteredStudents = filteredStudents.filter(
        (student) => String(student.year) === String(currentYear)
      );
    }

    const sortedStudents = [...filteredStudents].sort((a, b) => {
      const yearA = parseInt(a.year);
      const yearB = parseInt(b.year);
      if (yearA !== yearB) return yearA - yearB;
      return a.rollNo.localeCompare(b.rollNo);
    });

    const csv = Papa.unparse(
      sortedStudents.map((student) => {
        const department =
          typeof student.department === "string"
            ? student.department
            : student.department?.name || "N/A";

        const section =
          typeof student.section === "string"
            ? student.section
            : String(student.section || "N/A");

        const year =
          typeof student.year === "string"
            ? student.year
            : String(student.year || "N/A");

        return {
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          department,
          year,
          section,
          leetcode_easy: student.stats.leetcode?.solved?.Easy || 0,
          leetcode_medium: student.stats.leetcode?.solved?.Medium || 0,
          leetcode_hard: student.stats.leetcode?.solved?.Hard || 0,
          hackerrank_badges: student.stats.hackerrank?.badges?.length || 0,
          codechef_rating: student.stats.codechef?.rating || 0,
          codechef_solved: student.stats.codechef?.fullySolved || 0,
          codeforces_rating: student.stats.codeforces?.rating || 0,
          codeforces_rank: student.stats.codeforces?.rank || "N/A",
          codeforces_contests: student.stats.codeforces?.contests || 0,
          skillrack_solved: student.stats.skillrack?.programsSolved || 0,
          skillrack_rank: student.stats.skillrack?.rank || "N/A",
          github_commits: student.stats.github?.totalCommits || 0,
          github_repos: student.stats.github?.totalRepos || 0,
        };
      })
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${scope}_students.csv`;
    link.click();
    toast.success("CSV exported successfully!");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center">
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
        <button
          onClick={() => setIsAddDepartmentModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Plus
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Add Department
          </span>
        </button>
        <button
          onClick={() => setIsAddClassModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Plus
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Add Class
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
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ChartBar
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {location.pathname === "/chart" ? "View Dashboard" : "View Chart"}
          </span>
        </button>
        <button
          onClick={() => handleExportCSV(currentClass ? "class" : "department")}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700"
        >
          <Download className="dark:text-gray-100 text-gray-800" size={18} />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Export CSV
          </span>
        </button>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex border ml-3 border-gray-500 items-center gap-2 p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <User size={"1.5rem"} className="text-gray-400 dark:text-gray-300" />
        </button>
      </div>
      {isProfileModalOpen && (
        <Profile onClose={() => setIsProfileModalOpen(false)} />
      )}
      {isAddDepartmentModalOpen && (
        <AddDepartment onClose={() => setIsAddDepartmentModalOpen(false)} />
      )}
      {isAddClassModalOpen && (
        <AddClass onClose={() => setIsAddClassModalOpen(false)} />
      )}
    </div>
  );
}
