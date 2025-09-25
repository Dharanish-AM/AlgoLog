import React, { useState, useMemo, useEffect } from 'react';
import { getAllStudents } from '../../services/adminOperations';
import FilterPanel from '../FilterPanel';
import StudentsTable from '../StudentsTable';

const StudentsView = () => {
  const [filters, setFilters] = useState({
    department: '',
    class: '',
    year: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await getAllStudents();
        setAllStudents(students);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const matchesDepartment = !filters.department || student.department === filters.department;
      const matchesClass = !filters.class || student.class === filters.class;
      const matchesYear = !filters.year || student.year.toString() === filters.year;
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDepartment && matchesClass && matchesYear && matchesSearch;
    });
  }, [filters, searchTerm, allStudents]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Students Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-400">Track coding progress and performance metrics</p>
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