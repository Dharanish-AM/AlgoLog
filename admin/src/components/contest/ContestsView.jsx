import React, { useState, useMemo } from "react";
import FilterPanel from "../FilterPanel";
import ContestsTable from "../ContestsTable";
import ParticipantsView from "../ParticipantsView";
import { useSelector, useDispatch } from "react-redux";
import { refetchContests } from "../../services/adminOperations";
import toast from "react-hot-toast";
import { RefreshCw, Trophy, Users, TrendingUp, Target } from "lucide-react";

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Contests</p>
              <h3 className="text-2xl font-bold text-white">{filteredContests.length}</h3>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Participants</p>
              <h3 className="text-2xl font-bold text-white">
                {allStudents.filter(s => s.stats?.leetcode?.contests?.length > 0).length}
              </h3>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Participation</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredContests.length > 0 
                  ? Math.round(allStudents.reduce((sum, s) => sum + (s.stats?.leetcode?.contests?.length || 0), 0) / filteredContests.length)
                  : 0}
              </h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Problems</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredContests.length > 0
                  ? Math.round(filteredContests.reduce((sum, c) => sum + (c.totalProblems || 0), 0) / filteredContests.length)
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
