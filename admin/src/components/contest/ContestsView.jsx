import React, { useState, useEffect, useMemo } from "react";
import FilterPanel from "../FilterPanel";
import ContestsTable from "../ContestsTable";
import ParticipantsView from "../ParticipantsView";
import { getAllContests, getAllStudents } from "../../services/adminOperations";

const ContestsView = ({ token }) => {
  const [allContests, setAllContests] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Using minimal filter state for contests
  const [filters] = useState({
    department: "",
    class: "",
    year: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const students = await getAllStudents(token, null);
        setAllStudents(students);

        const contests = await getAllContests(token, null);
        setAllContests(contests);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token]);

  const handleFilterChange = () => {
    // Placeholder for contest-specific filters if needed
  };

  const filteredContests = useMemo(() => {
    return allContests.filter((contest) => {
      const matchesSearch =
        !searchTerm ||
        contest.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [allContests, searchTerm]);

  const handleContestClick = (contest) => {
    setSelectedContest(contest);
  };

  const handleBack = () => {
    setSelectedContest(null);
  };

  if (selectedContest) {
    return (
      <ParticipantsView
        contest={selectedContest}
        onBack={handleBack}
        allStudents={allStudents} // Pass students for filtering participants
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Contests Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Monitor contest participation and results
        </p>
      </div>

      <FilterPanel
        filters={filters}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchTerm}
        placeholder="Search contests..."
      />

      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-400">
        Showing {filteredContests.length} contests
      </div>

      <div className="flex-1 min-h-0">
        <ContestsTable
          contests={filteredContests}
          onContestClick={handleContestClick}
        />
      </div>
    </div>
  );
};

export default ContestsView;
