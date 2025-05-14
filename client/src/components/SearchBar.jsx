import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedPlatform,
  setSelectedPlatform,
  onShowTopPerformer,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <option value={"all"}>All Platforms</option>
          <option value={"leetcode"}>LeetCode</option>
          <option value={"hackerrank"}>HackerRank</option>
          <option value={"codechef"}>CodeChef</option>
          <option value={"codeforces"}>Codeforces</option>
          <option value={"skillrack"}>SkillRack</option>
          <option value={"github"}>GitHub</option>
        </select>
      </div>
      <button
        onClick={onShowTopPerformer}
        className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all text-sm font-medium"
      >
        Top Performers
      </button>
    </div>
  );
};

export default SearchBar;
