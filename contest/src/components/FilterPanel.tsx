import React from 'react';
import { Search } from 'lucide-react';
import { FilterState } from '../types';
import { departments, classes, years } from '../utils/mockData';

interface FilterPanelProps {
  filters: FilterState;
  searchTerm: string;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  searchTerm,
  onFilterChange,
  onSearchChange,
  placeholder = "Search students..."
}) => {
  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0 sm:min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Department Filter */}
        <div className="min-w-0 sm:min-w-48">
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div className="min-w-0 sm:min-w-32">
          <select
            value={filters.class}
            onChange={(e) => onFilterChange('class', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="min-w-0 sm:min-w-36">
          <select
            value={filters.year}
            onChange={(e) => onFilterChange('year', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;