import React from "react";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
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
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 border border-slate-600 text-sm whitespace-nowrap"
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
              Contest Participants
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Contest Info */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-slate-400">Start Time:</span>
            <p className="text-white font-medium text-xs sm:text-sm truncate">
              {formatDate(contest.startTime)}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Duration:</span>
            <p className="text-white font-medium">
              {formatDuration(contest.duration)}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Type:</span>
            <p className="text-white font-medium">
              {contest.virtual ? "Virtual" : "Live"}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Total Participants:</span>
            <p className="text-white font-medium">
              {contest.participants?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                  Rank
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                  Roll No
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                  Problems
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Rating
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Contest Rank
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                  Trend
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Finish Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {contest.participants?.map((participant, index) => (
                <tr
                  key={participant.id}
                  className="hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-slate-200 hidden sm:table-cell">
                    {participant.rollNo}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white truncate max-w-32 sm:max-w-none">
                        {participant.name}
                      </div>
                      <div className="text-xs font-mono text-slate-400 sm:hidden">
                        {participant.rollNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-white">
                      {participant.problemsSolved}/{participant.totalProblems}
                    </span>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${
                            (participant.problemsSolved /
                              participant.totalProblems) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center hidden md:table-cell">
                    <span
                      className={`text-sm font-semibold ${
                        participant.rating >= 2000
                          ? "text-purple-400"
                          : participant.rating >= 1600
                          ? "text-blue-400"
                          : participant.rating >= 1200
                          ? "text-green-400"
                          : "text-slate-300"
                      }`}
                    >
                      {participant.rating}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-sm text-slate-300 hidden lg:table-cell">
                    {participant.rank}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                    {getTrendIcon(participant.trend)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-sm text-slate-300 hidden lg:table-cell">
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
