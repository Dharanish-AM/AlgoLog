import React from "react";
import { Clock, Users, Calendar, ChevronRight, Trophy } from "lucide-react";
import { useSelector } from "react-redux";

const ContestsTable = ({ contests, onContestClick }) => {
  const allStudents = useSelector((state) => state.admin.allStudents);
  const formatDate = (timestamp) => {
    const date =
      timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getParticipantsCount = (contest) => {
    const matchedStudents = allStudents
      .filter((student) =>
        student.stats?.leetcode?.contests?.some(
          (c) => c.title === contest.title
        )
      )
      .map((student) => {
        const contestStats = student.stats.leetcode.contests.find(
          (c) => c.title === contest.title
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
      });
    return matchedStudents.length;
  };

  if (contests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 sm:p-16 text-center shadow-xl h-full flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-700/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Contests Found</h3>
          <p className="text-slate-400 mb-6">
            There are no LeetCode contests available at the moment.
          </p>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-purple-300">
              🔄 Try refreshing to fetch the latest contests
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-700 to-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                S.No
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                Contest
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                Start Time
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                Duration
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                Participants
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700/50">
            {contests.map((contest, index) => (
              <tr
                key={contest.id}
                className="hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-slate-700/10 transition-all duration-300 cursor-pointer group"
                onClick={() => onContestClick(contest)}
              >
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm font-semibold text-slate-300">
                  {index + 1}
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          contest.virtual 
                            ? "bg-purple-500 shadow-lg shadow-purple-500/50" 
                            : "bg-blue-500 shadow-lg shadow-blue-500/50"
                        } animate-pulse`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                        {contest.title}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-0.5 rounded">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">{contest.totalProblems}</span> problems
                        </span>
                        <span className="lg:hidden text-xs">
                          {formatDate(contest.startTime).split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm text-slate-300 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{formatDate(contest.startTime)}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center hidden md:table-cell">
                  <div className="inline-flex items-center justify-center gap-1.5 text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">{formatDuration(contest.duration)}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                      contest.virtual
                        ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {contest.virtual ? "🔮 Virtual" : "⚡ Live"}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-sm text-slate-300 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="font-bold">{getParticipantsCount(contest)}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-right text-sm text-slate-300">
                  <button
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-all duration-200 text-xs sm:text-sm font-medium group-hover:gap-2 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContestClick(contest);
                    }}
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContestsTable;
