import React from "react";
import { Search, X } from "lucide-react";
import { useSelector } from "react-redux";

const FilterPanel = ({
  filters,
  searchTerm,
  onFilterChange,
  onSearchChange,
  placeholder = "Search students...",
}) => {
  const allStudents = useSelector((state) => state.admin.allStudents);

  // Extract unique departments, classes, and years
  const departments = Array.from(
    new Map(allStudents.map((s) => [s.department._id, s.department])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const classes = Array.from(new Set(allStudents.map((s) => s.section))).sort();

  const years = Array.from(new Set(allStudents.map((s) => s.year))).sort();

  const hasActiveFilters = filters.department || filters.class || filters.year || searchTerm;

  const clearAllFilters = () => {
    if (onFilterChange) {
      onFilterChange("department", "");
      onFilterChange("class", "");
      onFilterChange("year", "");
    }
    onSearchChange("");
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border border-slate-600 shadow-xl">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0 sm:min-w-64 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 w-4 h-4 transition-colors" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-700/70 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="min-w-0 sm:min-w-48">
            <select
              value={filters.department}
              onChange={(e) => onFilterChange("department", e.target.value)}
              className="w-full bg-slate-700/70 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all duration-200 cursor-pointer hover:bg-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="min-w-0 sm:min-w-32">
            <select
              value={filters.class}
              onChange={(e) => onFilterChange("class", e.target.value)}
              className="w-full bg-slate-700/70 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all duration-200 cursor-pointer hover:bg-slate-700"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="min-w-0 sm:min-w-36">
            <select
              value={filters.year}
              onChange={(e) => onFilterChange("year", e.target.value)}
              className="w-full bg-slate-700/70 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-700 transition-all duration-200 cursor-pointer hover:bg-slate-700"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap animate-fadeIn"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
