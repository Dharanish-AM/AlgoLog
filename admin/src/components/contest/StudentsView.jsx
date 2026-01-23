import React, { useState, useMemo } from "react";
import FilterPanel from "../FilterPanel";
import StudentsTable from "../StudentsTable";
import { useSelector } from "react-redux";
import { TrendingUp, Users, Award, Target } from "lucide-react";

const StudentsView = () => {
  const [filters, setFilters] = useState({
    department: "",
    class: "",
    year: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const allStudents = useSelector((state) => state.admin.allStudents);

  const handleFilterChange = (key, value) => {
    console.log("Filter changed:", key, value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredStudents = useMemo(() => {
    return allStudents
      .filter((student) => {
        const matchesDepartment =
          !filters.department ||
          student.department?.name === filters.department;
        const matchesClass =
          !filters.class || student.section === filters.class;
        const matchesYear = !filters.year || student.year === filters.year;
        const matchesSearch =
          !searchTerm ||
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

        return (
          matchesDepartment && matchesClass && matchesYear && matchesSearch
        );
      })
      .sort((a, b) => {
        // Example rollNo format: "23CS001"
        const regex = /^(\d+)([A-Z]+)(\d+)$/i;

        const parseRollNo = (rollNo) => {
          const match = rollNo.match(regex);
          if (!match) return [rollNo]; // fallback to string
          return [parseInt(match[1], 10), match[2], parseInt(match[3], 10)];
        };

        const [yearA, deptA, numA] = parseRollNo(a.rollNo);
        const [yearB, deptB, numB] = parseRollNo(b.rollNo);

        if (yearA !== yearB) return yearA - yearB;
        if (deptA !== deptB) return deptA.localeCompare(deptB);
        return numA - numB;
      });
  }, [filters, searchTerm, allStudents]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Students Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Track coding progress and performance metrics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Students</p>
              <h3 className="text-2xl font-bold text-white">{filteredStudents.length}</h3>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Active Participants</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredStudents.filter(s => s.stats?.leetcode?.contests?.length > 0).length}
              </h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Contests</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredStudents.length > 0
                  ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.stats?.leetcode?.contests?.length || 0), 0) / filteredStudents.length)
                  : 0}
              </h3>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Problems</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredStudents.length > 0
                  ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.stats?.leetcode?.solved?.All || 0), 0) / filteredStudents.length)
                  : 0}
              </h3>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        filters={filters}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchTerm}
        placeholder="Search by name or roll number..."
      />

      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-400">
        Showing {filteredStudents.length} of {allStudents.length} students
      </div>

      <div className="flex-1 min-h-0">
        <StudentsTable students={filteredStudents} />
      </div>
    </div>
  );
};

export default StudentsView;
