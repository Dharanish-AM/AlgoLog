import React from "react";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import { exportToCSV } from "../utils/csvExport";

const ParticipantsView = ({ contest, onBack }) => {
  const handleDownloadCSV = () => {
    if (contest.participants) {
      exportToCSV(contest.participants, contest.title);
    }
  };

  const formatFinishTime = (seconds) => {
    if (!seconds || seconds === 0) {
      return "-";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "same":
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
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

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 border border-slate-600 text-sm whitespace-nowrap hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Contests</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              {contest.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              🏆 Contest Leaderboard
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200 text-sm whitespace-nowrap shadow-lg hover:shadow-xl"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Contest Info */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 sm:p-6 rounded-xl border border-slate-600 shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400 text-xs">Start Time:</span>
            <p className="text-white font-semibold text-xs sm:text-sm truncate mt-1">
              {formatDate(contest.startTime)}
            </p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400 text-xs">Duration:</span>
            <p className="text-white font-semibold mt-1">
              {formatDuration(contest.duration)}
            </p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400 text-xs">Type:</span>
            <p className="text-white font-semibold mt-1">
              {contest.virtual ? "🔮 Virtual" : "⚡ Live"}
            </p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400 text-xs">Total Participants:</span>
            <p className="text-white font-semibold mt-1">
              {contest.participants?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium - Only show if we have participants */}
      {contest.participants?.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Top Performers
          </h2>
          <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
            {/* 2nd Place */}
            {contest.participants[1] && (
              <div className="flex-1 text-center transform hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-4 rounded-xl border-2 border-slate-400 shadow-lg">
                  <Medal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-300 mb-1">2</div>
                  <div className="text-sm font-semibold text-white truncate">{contest.participants[1].name}</div>
                  <div className="text-xs text-slate-400 font-mono mb-2">{contest.participants[1].rollNo}</div>
                  <div className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                    {contest.participants[1].problemsSolved}/{contest.participants[1].totalProblems} solved
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {contest.participants[0] && (
              <div className="flex-1 text-center transform hover:scale-110 transition-transform">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-6 rounded-xl border-2 border-yellow-400 shadow-2xl shadow-yellow-500/20">
                  <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-4xl font-bold text-yellow-400 mb-1">1</div>
                  <div className="text-base font-bold text-white truncate">{contest.participants[0].name}</div>
                  <div className="text-xs text-slate-300 font-mono mb-2">{contest.participants[0].rollNo}</div>
                  <div className="text-sm text-yellow-300 bg-yellow-500/10 px-3 py-1 rounded font-semibold">
                    {contest.participants[0].problemsSolved}/{contest.participants[0].totalProblems} solved
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {contest.participants[2] && (
              <div className="flex-1 text-center transform hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 p-4 rounded-xl border-2 border-orange-400 shadow-lg">
                  <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-orange-400 mb-1">3</div>
                  <div className="text-sm font-semibold text-white truncate">{contest.participants[2].name}</div>
                  <div className="text-xs text-slate-400 font-mono mb-2">{contest.participants[2].rollNo}</div>
                  <div className="text-xs text-slate-300 bg-orange-500/10 px-2 py-1 rounded">
                    {contest.participants[2].problemsSolved}/{contest.participants[2].totalProblems} solved
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex-1 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                  Rank
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                  Roll No
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                  Problems
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Rating
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Contest Rank
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                  Trend
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Finish Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700/50">
              {contest.participants?.map((participant, index) => (
                <tr
                  key={participant.id}
                  className={`hover:bg-gradient-to-r transition-all duration-300 ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500/5 to-transparent hover:from-yellow-500/10"
                      : index === 1
                      ? "bg-gradient-to-r from-slate-500/5 to-transparent hover:from-slate-500/10"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-500/5 to-transparent hover:from-orange-500/10"
                      : "hover:from-slate-700/30 hover:to-transparent"
                  }`}
                >
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                      {index === 1 && <Medal className="w-4 h-4 text-slate-300" />}
                      {index === 2 && <Award className="w-4 h-4 text-orange-400" />}
                      <div
                        className={`text-sm font-bold ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-slate-300"
                            : index === 2
                            ? "text-orange-400"
                            : "text-slate-400"
                        }`}
                      >
                        #{participant.rank}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-xs sm:text-sm font-mono text-slate-200 hidden sm:table-cell font-semibold">
                    {participant.rollNo}
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-white truncate max-w-32 sm:max-w-none">
                        {participant.name}
                      </div>
                      <div className="text-xs font-mono text-slate-400 sm:hidden">
                        {participant.rollNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white">
                        {participant.problemsSolved}/{participant.totalProblems}
                      </span>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (participant.problemsSolved / participant.totalProblems) * 100 === 100
                              ? "bg-gradient-to-r from-green-500 to-green-400"
                              : (participant.problemsSolved / participant.totalProblems) * 100 >= 75
                              ? "bg-gradient-to-r from-blue-500 to-blue-400"
                              : (participant.problemsSolved / participant.totalProblems) * 100 >= 50
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                              : "bg-gradient-to-r from-red-500 to-red-400"
                          }`}
                          style={{
                          width: `${
                            (participant.problemsSolved /
                              participant.totalProblems) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                        participant.rating >= 2000
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : participant.rating >= 1600
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : participant.rating >= 1200
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                      }`}
                    >
                      {participant.rating}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center text-sm font-semibold text-slate-300 hidden lg:table-cell">
                    {participant.rank}
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
                      {getTrendIcon(participant.trend)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center text-sm font-medium text-slate-300 hidden lg:table-cell">
                    {formatFinishTime(participant.finishTime)}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 sm:py-12 text-center text-slate-400"
                  >
                    No participants found for this contest
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsView;
