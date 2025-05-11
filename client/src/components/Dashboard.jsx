import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar.jsx";
import StudentTable from "./StudentTable.jsx";
import StudentCard from "./StudentCard.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import AddStudentModal from "./AddStudentModal.jsx";
import { Code, Download, Loader, Search, Upload, UserPlus } from "lucide-react";
import axios from "axios";
import Papa from "papaparse";
import toast, { Toaster } from "react-hot-toast";
import { GridLoader, MoonLoader } from "react-spinners";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/students`
      );
      if (response.status === 200) {
        const updatedStudents = response.data.students;
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        setTotalCount(response.data.totalCount || updatedStudents.length);

        // Refresh selected student if applicable
        if (selectedStudent) {
          const updatedSelected = updatedStudents.find(
            (s) => s._id === selectedStudent._id
          );
          if (updatedSelected) {
            setSelectedStudent(updatedSelected);
          }
        }

        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to fetch student data. Please try again later.");
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/students/refetch`
      );
      if (response.status === 200) {
        const updatedStudents = response.data.students;
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        setTotalCount(response.data.totalCount || updatedStudents.length);

        if (selectedStudent) {
          const updatedSelected = updatedStudents.find(
            (s) => s._id === selectedStudent._id
          );
          if (updatedSelected) {
            setSelectedStudent(updatedSelected);
          }
        }

        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to fetch student data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = students ? [...students] : [];

    if (searchTerm) {
      const term = searchTerm?.toLowerCase();
      result = result.filter((student) =>
        student.name?.toLowerCase()?.includes(term)
      );
    }

    result.sort((a, b) => {
      let valueA, valueB;

      if (sortField === "leetcode.total") {
        valueA =
          a.leetcode?.solved?.Easy +
          a.leetcode?.solved?.Medium +
          a.leetcode?.solved?.Hard;
        valueB =
          b.leetcode?.solved?.Easy +
          b.leetcode?.solved?.Medium +
          b.leetcode?.solved?.Hard;
      } else if (sortField === "codechef.rating") {
        valueA = a.codechef?.rating || 0;
        valueB = b.codechef?.rating || 0;
      } else if (sortField === "codeforces.rating") {
        valueA = a.codeforces?.rating || 0;
        valueB = b.codeforces?.rating || 0;
      } else {
        valueA = a[sortField];
        valueB = b[sortField];
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredStudents(result);

    if (selectedStudent && !result.find((s) => s._id === selectedStudent._id)) {
      setSelectedStudent(null);
    }
  }, [students, searchTerm, sortField, sortDirection, selectedStudent]);

  const handleAddStudent = async (newStudent) => {
    console.log(newStudent);
    setAddLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students`,
        newStudent
      );
      if (response?.status === 200 || response?.status === 201) {
        await fetchData();
        setIsAddModalOpen(false);
        toast.success("Student added successfully!");
      }
      setError(null);
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student. Please try again.");
      toast.error("Failed to add student.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      students.map((student) => ({
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        department: student.department,
        year: student.year,
        section: student.section,
        leetcode_easy: student.stats.leetcode?.solved?.Easy || 0,
        leetcode_medium: student.stats.leetcode?.solved?.Medium || 0,
        leetcode_hard: student.stats.leetcode?.solved?.Hard || 0,
        hackerrank_badges: student.stats.hackerrank?.badges?.length || 0,
        codechef_rating: student.stats.codechef?.rating || 0,
        codechef_solved: student.stats.codechef?.fullySolved || 0,
        codeforces_rating: student.stats.codeforces?.rating || 0,
        codeforces_rank: student.stats.codeforces?.rank || "N/A",
        codeforces_contests: student.stats.codeforces?.contests || 0,
      }))
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
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {addLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-60">
          <MoonLoader color="#C084FC" size={40} />
        </div>
      )}
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Code size={32} className="text-blue-600 dark:text-purple-400" />
            <h1 className="ml-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
              AlgoLog
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated:{" "}
              {students && students[0]?.updatedAt
                ? new Date(students[0].updatedAt).toLocaleString("en-US", {
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
              onClick={refreshData}
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
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700"
            >
              <UserPlus size={18} />
              <span className="text-sm">Add Student</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Download
                className="dark:text-gray-100 text-gray-800"
                size={18}
              />
              <span className="text-sm text-gray-900 dark:text-gray-100 text-gray-800">
                Export CSV
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 justify-center border dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 bg-white dark:bg-gray-800 rounded-md shadow-sm px-10 py-4 rounded-xl shadow-md">
            <span className="dark:text-gray-100 flex-shrink-0 text-sm">
              Total Students:{" "}
            </span>
            <span className="text-sm dark:text-gray-100">{totalCount}</span>
          </div>
          <SearchBar
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
          />
        </div>

        <div className="space-y-6">
          {filteredStudents && filteredStudents.length > 0 ? (
            <StudentTable
              students={filteredStudents}
              loading={loading}
              error={error}
              sortField={sortField}
              sortDirection={sortDirection}
              setSortField={setSortField}
              setSortDirection={setSortDirection}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
            />
          ) : (
            <div className="text-center text-m italic text-gray-500">
              No students found
            </div>
          )}
        </div>

        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddStudent}
          loading={addLoading}
        />

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <StudentCard
              onClose={() => setSelectedStudent(null)}
              student={selectedStudent}
              reFetchStudents={fetchData}
            />
          </div>
        )}

        <Toaster position="bottom-right" />
        <footer className="fixed bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded shadow-md backdrop-blur-sm">
          Made with 💻 by{" "}
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
