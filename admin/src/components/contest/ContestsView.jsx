import React, { useState, useMemo } from "react";
import FilterPanel from "../FilterPanel";
import ContestsTable from "../ContestsTable";
import ParticipantsView from "../ParticipantsView";
import { useSelector, useDispatch } from "react-redux";
import { refetchContests } from "../../services/adminOperations";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

const ContestsView = () => {
  const allContests = useSelector((state) => state.admin.allContests);
  const allStudents = useSelector((state) => state.admin.allStudents);
  const [selectedContest, setSelectedContest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const [filters] = useState({
    department: "",
    class: "",
    year: "",
  });

  const handleFilterChange = () => {
    // Placeholder for contest-specific filters if needed
  };

  const handleRefetch = async () => {
    setIsRefetching(true);
    const loadingToast = toast.loading("Refetching contests from LeetCode...");
    try {
      const result = await refetchContests(token, dispatch);
      toast.success(
        `Successfully refetched ${result.count ?? result?.contests?.length ?? ""} contests!`,
        { id: loadingToast }
      );
    } catch (error) {
      console.error("Error refetching contests:", error);
      toast.error(
        error.response?.data?.message || "Failed to refetch contests",
        { id: loadingToast }
      );
    } finally {
      setIsRefetching(false);
    }
  };

  const filteredContests = useMemo(() => {
    return allContests
      .filter((contest) => {
        const matchesSearch =
          !searchTerm ||
          contest.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => b.startTime - a.startTime);
  }, [allContests, searchTerm]);

  const handleContestClick = (contest) => {
    setSelectedContest(contest);
  };

  const handleBack = () => {
    setSelectedContest(null);
  };

  if (selectedContest) {
    console.log("Selected Contest:", selectedContest);

    const matchedStudents = allStudents
      .filter((student) =>
        student.stats?.leetcode?.contests?.some(
          (c) => c.title === selectedContest.title
        )
      )
      .map((student) => {
        const contestStats = student.stats.leetcode.contests.find(
          (c) => c.title === selectedContest.title
        );
        return {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          problemsSolved: contestStats?.problemsSolved || 0,
          totalProblems: contestStats?.totalProblems || 0,
          rating: contestStats?.rating || 0,
          rank: contestStats?.ranking || 0,
          trend: contestStats?.trendDirection?.toLowerCase() || "same",
          finishTime: contestStats?.finishTimeInSeconds || 0,
        };
      })
      .sort((a, b) => {
        // First sort by rank if both have rank
        if (a.rank && b.rank) {
          if (a.rank !== b.rank) return a.rank - b.rank;
        }

        // If rank is missing or same, sort by problems solved (desc)
        if (a.problemsSolved !== b.problemsSolved) {
          return b.problemsSolved - a.problemsSolved;
        }

        // If problems solved are same, sort by rating (desc)
        if (a.rating !== b.rating) {
          return b.rating - a.rating;
        }

        // If rating is same, sort by finish time (asc)
        return a.finishTime - b.finishTime;
      });

    console.log(`Total Matched Students: ${matchedStudents.length}`);
    console.log("Mapped & Sorted Participants:", matchedStudents);

    return (
      <ParticipantsView
        contest={{ ...selectedContest, participants: matchedStudents }}
        onBack={handleBack}
        allStudents={matchedStudents}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Contests Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Monitor contest participation and results
          </p>
        </div>
        <button
          onClick={handleRefetch}
          disabled={isRefetching}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isRefetching
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          {isRefetching ? "Refetching..." : "Refetch Contests"}
        </button>
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
