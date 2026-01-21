import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GridLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

import Header from "./Header.jsx";
import SearchBar from "../../components/SearchBar";
import StudentTable from "../../components/StudentTable";
import { Search, X } from "lucide-react";

const getFullDeptName = (short) => {
  const map = {
    CSE: "Computer Science Engineering",
    IT: "Information Technology",
    ECE: "Electronics and Communication Engineering",
    EEE: "Electrical and Electronics Engineering",
    AIML: "Artificial Intelligence and Machine Learning",
    AIDS: "Artificial Intelligence and Data Science",
    CSBS: "Computer Science and Business Systems",
    CCE: "Computer and Communication Engineering",
    MECH: "Mechanical Engineering",
  };
  return map[short] || short;
};

export default function DepartmentDash() {
  const department = useSelector((state) => state.auth.department);
  const classes = useState(department.classes);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [showTopPerformer, setShowTopPerformer] = useState(false);
  const token = localStorage.getItem("token");
  const departmentUser = useSelector((state) => state.auth.class);

  const [selectedClass, setSelectedClass] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedClass) {
      setFilteredStudents(selectedClass.students || []);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (department) {
      setTotalCount(department.classes.length);
    }
  }, []);

  if (!department) {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-wide text-white">
            {getFullDeptName(department.name)}
          </h1>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 mr-2 justify-center border dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 bg-white dark:bg-gray-800 rounded-xl shadow-sm px-10 py-4">
            <span className="dark:text-gray-100 item-center flex-shrink-0 justify-center text-sm">
              Total Classes:{" "}
            </span>
            <span className="text-sm dark:text-gray-100">{totalCount}</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                placeholder="Search students..."
                className="pl-11 pr-10 py-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <X
                    size={18}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  />
                </button>
              )}
            </div>

            <div className="flex-shrink-0">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
              >
                <option value={"all"}>All Years</option>

                {[...new Set(department.classes.map((cls) => cls.year))].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}

              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
          {department.classes
            .filter((cls) =>
              selectedPlatform === "all" ? true : cls.year === selectedPlatform
            )
            .filter((cls) =>
              searchTerm
                ? cls.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.year?.toLowerCase().includes(searchTerm.toLowerCase())
                : true
            )
            .sort((a, b) => a.section.localeCompare(b.section))
            .map((cls) => (
              <div
                key={cls._id}
                onClick={() => navigate(`/class/${cls._id}`)}
                className={`group relative bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden
                  ${selectedClass?._id === cls._id
                    ? "border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/20"
                    : "border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-1"
                  }
                `}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                      {cls.username}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                        Section {cls.section}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                        {cls.year}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-end justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                      {cls.students.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="space-y-6">
          {filteredStudents && filteredStudents.length > 0 && selectedClass && (
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
}
