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
import { GridLoader } from "react-spinners";

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
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
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
        student.name?.toLowerCase().includes(term)
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
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students`,
        newStudent
      );
      if (response?.status === 200 || response?.status === 201) {
        fetchData();
        setIsAddModalOpen(false);
        toast.success("Student added successfully!");
      }
      setError(null);
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student. Please try again.");
      toast.error("Failed to add student.");
      return;
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      students.map((student) => ({
        name: student.name,
        avatar: student.avatar,
        leetcode_easy: student.leetcode.easy,
        leetcode_medium: student.leetcode.medium,
        leetcode_hard: student.leetcode.hard,
        codechef_rating: student.codechef.rating,
        codechef_solved: student.codechef.solved,
        codeforces_rating: student.codeforces.rating,
        codeforces_rank: student.codeforces.rank,
        codeforces_contests: student.codeforces.contests,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.csv";
    link.click();
    toast.success("CSV exported successfully!");
  };

  const handleImportCSV = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const newStudents = results.data.slice(1).map((row) => ({
          id: crypto.randomUUID(),
          name: row[0],
          avatar: row[1],
          leetcode: {
            easy: parseInt(row[2]) || 0,
            medium: parseInt(row[3]) || 0,
            hard: parseInt(row[4]) || 0,
            total: parseInt(row[2]) + parseInt(row[3]) + parseInt(row[4]) || 0,
          },
          hackerrank: {
            badges: [],
          },
          codechef: {
            rating: parseInt(row[5]) || 0,
            solved: parseInt(row[6]) || 0,
          },
          codeforces: {
            rating: parseInt(row[7]) || 0,
            rank: row[8] || "Newbie",
            contests: parseInt(row[9]) || 0,
          },
        }));
        setStudents((prev) => [...prev, ...newStudents]);
        toast.success("CSV imported successfully!");
      },
      header: true,
      error: () => {
        toast.error("Error importing CSV file");
      },
    });
    event.target.value = "";
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
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Code size={32} className="text-blue-600 dark:text-purple-400" />
            <h1 className="ml-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
              AlgoLog
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              <Upload size={18} />
              <span className="text-sm">Import CSV</span>
            </label>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Download size={18} />
              <span className="text-sm">Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <UserPlus size={18} />
              <span className="text-sm">Add Student</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="mb-6">
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
        />

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <StudentCard
              onClose={() => setSelectedStudent(null)}
              student={selectedStudent}
            />
          </div>
        )}

        <Toaster position="bottom-right" />
      </div>
    </div>
  );
};

export default Dashboard;
