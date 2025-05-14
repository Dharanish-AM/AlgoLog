import React from "react";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getStudents } from "../services/studentOperations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Chart() {
  const students = useSelector((state) => state.students.students);
  const [filteredStudents, setFilteredStudents] = React.useState([]);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [selectedRollNo, setSelectedRollNo] = React.useState("");

  const fetchStudents = async () => {
    await getStudents(token, dispatch);
  };

useEffect(() => {
  if (students.length > 0) {
    const sorted = [...students].sort((a, b) =>
      a.rollNo?.localeCompare(b.rollNo, undefined, { numeric: true })
    );
    setFilteredStudents(sorted);
  }
}, [students]);

  const selectedStudent = filteredStudents.find((s) => s.rollNo === selectedRollNo);

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

  useEffect(() => {
    fetchStudents();
  }, []);
  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      <div className="mt-10 space-y-10">
        <div className="mb-6">
          <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">
            Select Student:
          </label>
          <select
            value={selectedRollNo}
            onChange={(e) => setSelectedRollNo(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Students</option>
            {filteredStudents.map((student) => (
              <option key={student.rollNo} value={student.rollNo}>
                {student.rollNo} - {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Overall Analytics
          </h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={[
                {
                  platform: "LeetCode",
                  solved: selectedRollNo
                    ? selectedStudent?.stats?.leetcode?.solved?.All || 0
                    : aggregateStats.leetcode,
                },
                {
                  platform: "Codeforces",
                  solved: selectedRollNo
                    ? selectedStudent?.stats?.codeforces?.problemsSolved || 0
                    : aggregateStats.codeforces,
                },
                {
                  platform: "CodeChef",
                  solved: selectedRollNo
                    ? selectedStudent?.stats?.codechef?.fullySolved || 0
                    : aggregateStats.codechef,
                },
                {
                  platform: "Skillrack",
                  solved: selectedRollNo
                    ? selectedStudent?.stats?.skillrack?.programsSolved || 0
                    : aggregateStats.skillrack,
                },
                {
                  platform: "GitHub Commits",
                  solved: selectedRollNo
                    ? selectedStudent?.stats?.github?.totalCommits || 0
                    : aggregateStats.github,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const total = selectedRollNo
                    ? (selectedStudent?.stats?.leetcode?.solved?.All || 0) +
                      (selectedStudent?.stats?.codeforces?.problemsSolved ||
                        0) +
                      (selectedStudent?.stats?.codechef?.fullySolved || 0) +
                      (selectedStudent?.stats?.skillrack?.programsSolved || 0) +
                      (selectedStudent?.stats?.github?.totalCommits || 0)
                    : aggregateStats.leetcode +
                      aggregateStats.codeforces +
                      aggregateStats.codechef +
                      aggregateStats.skillrack +
                      aggregateStats.github;
                  const percent =
                    total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);
                  return selectedRollNo
                    ? [`${value} (${percent}%)`, name]
                    : [`${percent}%`, name];
                }}
              />
              <Legend
                payload={[
                  { value: "LeetCode", type: "round", color: "#E55050" },
                  { value: "Codeforces", type: "round", color: "#D2DE32" },
                  { value: "CodeChef", type: "round", color: "#FF9800" },
                  { value: "Skillrack", type: "round", color: "#57B4BA" },
                  { value: "GitHub Commits", type: "round", color: "#FFAAAA" },
                ]}
              />
              <Bar dataKey="solved">
                <Cell fill="#E55050" />
                <Cell fill="#D2DE32" />
                <Cell fill="#FF9800" />
                <Cell fill="#57B4BA" />
                <Cell fill="#FFAAAA" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
