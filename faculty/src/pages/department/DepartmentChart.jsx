import React, { useEffect, useState } from "react";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import { handleGetUser } from "../../services/authOperations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DepartmentChart() {
  const department = useSelector((state) => state.auth.department);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [topFilteredStudents, setTopFilteredStudents] = useState([]);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [viewMode, setViewMode] = useState("class");
  const [selectedRollNo, setSelectedRollNo] = useState("");

  useEffect(() => {
    if (!department && token) {
      const fetchUser = async () => {
        try {
          const res = await handleGetUser(token);
          if (res) {
            dispatch({
              type: "SET_AUTH",
              payload: {
                isAuthenticated: true,
                class: res.user,
                department: res.user,
                token: token,
                role: res.role,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      };
      fetchUser();
    }
  }, []);

useEffect(() => {
  if (department && department.classes) {
    const allStudents = department.classes.flatMap(cls => cls.students || []);
    setStudents(allStudents);
  }
}, [department]);


  useEffect(() => {
    if (students.length > 0) {
      const sorted = [...students].sort((a, b) =>
        a.rollNo?.localeCompare(b.rollNo, undefined, { numeric: true })
      );
      setFilteredStudents(sorted);
    }
  }, [students]);

  useEffect(() => {
    let filtered = [...filteredStudents];
    if (selectedSection) {
      filtered = filtered.filter((s) => s.section === selectedSection);
    }
    if (selectedYear) {
      filtered = filtered.filter((s) => s.year === selectedYear);
    }
    const top = filtered
      .map((student) => ({
        name: student.name,
        leetcode: student.stats?.leetcode?.solved?.All || 0,
        codeforces: student.stats?.codeforces?.problemsSolved || 0,
        codechef: student.stats?.codechef?.fullySolved || 0,
        skillrack: student.stats?.skillrack?.programsSolved || 0,
        github: student.stats?.github?.totalCommits || 0,
      }))
      .sort((a, b) => {
        const totalA = a.leetcode + a.codeforces + a.codechef + a.skillrack + a.github;
        const totalB = b.leetcode + b.codeforces + b.codechef + b.skillrack + b.github;
        return totalB - totalA;
      })
      .slice(0, 10);
    setTopFilteredStudents(top);
  }, [filteredStudents, selectedSection, selectedYear]);

  const selectedStudent = filteredStudents.find(
    (s) => s.rollNo === selectedRollNo
  );

  const aggregateStats = {
    leetcode: filteredStudents.reduce(
      (sum, s) => sum + (s.stats?.leetcode?.solved?.All || 0),
      0
    ),
    codeforces: filteredStudents.reduce(
      (sum, s) => sum + (s.stats?.codeforces?.problemsSolved || 0),
      0
    ),
    codechef: filteredStudents.reduce(
      (sum, s) => sum + (s.stats?.codechef?.fullySolved || 0),
      0
    ),
    skillrack: filteredStudents.reduce(
      (sum, s) => sum + (s.stats?.skillrack?.programsSolved || 0),
      0
    ),
    github: filteredStudents.reduce(
      (sum, s) => sum + (s.stats?.github?.totalCommits || 0),
      0
    ),
  };

  const classes = department?.classes || [];
  const selectedClass = classes.find((cls) => cls.section === selectedSection);

  const rawClassStats = classes.map((cls) => {
    const totalStats = (cls.students || []).reduce((sum, student) => {
      return (
        sum +
        (student.stats?.leetcode?.solved?.All || 0) +
        (student.stats?.codeforces?.problemsSolved || 0) +
        (student.stats?.codechef?.fullySolved || 0) +
        (student.stats?.skillrack?.programsSolved || 0) +
        (student.stats?.github?.totalCommits || 0)
      );
    }, 0);
    return { section: cls.section, totalStats };
  });

  const departmentTotalStats = rawClassStats.reduce((acc, cls) => acc + cls.totalStats, 0);

  const topClassesByStats = rawClassStats
    .map((cls) => ({
      section: cls.section,
      percent: departmentTotalStats ? ((cls.totalStats / departmentTotalStats) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  const topStudents = classes
    .flatMap((cls) => cls.students || [])
    .map((student) => ({
      name: student.name,
      leetcode: student.stats?.leetcode?.solved?.All || 0,
      codeforces: student.stats?.codeforces?.problemsSolved || 0,
      codechef: student.stats?.codechef?.fullySolved || 0,
      skillrack: student.stats?.skillrack?.programsSolved || 0,
      github: student.stats?.github?.totalCommits || 0,
    }))
    .sort((a, b) => {
      const totalA =
        a.leetcode + a.codeforces + a.codechef + a.skillrack + a.github;
      const totalB =
        b.leetcode + b.codeforces + b.codechef + b.skillrack + b.github;
      return totalB - totalA;
    })
    .slice(0, 10);

  const platformColors = {
    leetcode: "#E55050",
    codeforces: "#D2DE32",
    codechef: "#FF9800",
    skillrack: "#57B4BA",
    github: "#FFAAAA",
  };

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      <div className="mt-10 space-y-10">
        <div className="flex text-white text-sm gap-4 mb-6">
          <button
            onClick={() => setViewMode("class")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "class" ? "bg-purple-600 text-white" : "bg-gray-600"
            }`}
          >
            Classwise Chart
          </button>
          <button
            onClick={() => setViewMode("student")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "student"
                ? "bg-purple-600 text-white"
                : "bg-gray-600"
            }`}
          >
            Top Students by Platform
          </button>
        </div>
        {viewMode === "student" && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">
                Select Class Section:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
              >
                <option value="">All Sections</option>
                {classes.map((cls) => (
                  <option key={cls.section} value={cls.section}>
                    Section {cls.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">
                Select Year:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
              >
                <option value="">All Years</option>
                {[...new Set(filteredStudents.map((s) => s.year))].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
         {
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            {viewMode === "class"
              ? "Top Classes by Total Stats"
              : "Top Students by Platform"}
          </h2>
         }
          {viewMode === "class" ? (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={topClassesByStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="percent" name="Class Contribution (%)" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={topFilteredStudents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={70}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.entries(platformColors).map(([key, color]) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
