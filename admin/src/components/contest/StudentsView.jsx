import React, { useState, useMemo } from "react";
import FilterPanel from "../FilterPanel";
import StudentsTable from "../StudentsTable";
import { useSelector } from "react-redux";

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
