import React, { useState, useMemo } from 'react';
import { FilterState } from '../types';
import { mockStudents } from '../utils/mockData';
import FilterPanel from '../components/FilterPanel';
import StudentsTable from '../components/StudentsTable';

const StudentsView: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    department: '',
    class: '',
    year: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesDepartment = !filters.department || student.department === filters.department;
      const matchesClass = !filters.class || student.class === filters.class;
      const matchesYear = !filters.year || student.year.toString() === filters.year;
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDepartment && matchesClass && matchesYear && matchesSearch;
    });
  }, [filters, searchTerm]);

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
        Showing {filteredStudents.length} of {mockStudents.length} students
      </div>

      <div className="flex-1 min-h-0">
        <StudentsTable students={filteredStudents} />
      </div>
    </div>
  );
};

export default StudentsView;