import React from "react";
import { Clock, Users, Calendar, ChevronRight } from "lucide-react";
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

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                S.No
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Contest
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                Start Time
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                Duration
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Participants
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {contests.map((contest, index) => (
              <tr
                key={contest.id}
                className="hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                onClick={() => onContestClick(contest)}
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-300">
                  {index + 1}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        contest.virtual ? "bg-purple-500" : "bg-blue-500"
                      }`}
                    ></div>
                    <div>
                      <div className="text-sm font-medium text-white truncate max-w-48 sm:max-w-none">
                        {contest.title}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {contest.totalProblems} problems
                        </span>
                        <span className="lg:hidden text-xs">
                          {formatDate(contest.startTime).split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-300 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(contest.startTime)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1 text-sm text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatDuration(contest.duration)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contest.virtual
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {contest.virtual ? "Virtual" : "Live"}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-slate-300">
                    <Users className="w-4 h-4 text-slate-400" />
                    {getParticipantsCount(contest)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm text-slate-300">
                  <button
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs sm:text-sm"
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
