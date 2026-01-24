import React from "react";
import { Award } from "lucide-react";

const CodeChefStatsFaculty = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-yellow-900/20 rounded p-3 text-center text-sm text-gray-400">
        No CodeChef Data
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 rounded-lg p-4 border border-yellow-600/40">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-yellow-600/30">
        <Award className="w-4 h-4 text-yellow-500" />
        <span className="font-semibold text-sm text-yellow-400">CodeChef</span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Rating with Division */}
        {stats.rating && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Rating</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-400">{stats.rating}</span>
              {stats.division && (
                <span className="bg-yellow-700/40 text-yellow-300 px-1.5 py-0.5 rounded text-xs">
                  {stats.division}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Highest Rating */}
        {stats.highestRating && (
          <div className="flex justify-between text-gray-400">
            <span>Highest</span>
            <span className="text-purple-300">{stats.highestRating}</span>
          </div>
        )}

        {/* Global Rank */}
        {stats.globalRank && (
          <div className="flex justify-between text-gray-400">
            <span>Global Rank</span>
            <span className="text-blue-400">#{stats.globalRank.toLocaleString()}</span>
          </div>
        )}

        {/* Country Rank */}
        {stats.countryRank && (
          <div className="flex justify-between text-gray-400">
            <span>Country Rank</span>
            <span className="text-cyan-400">#{stats.countryRank.toLocaleString()}</span>
          </div>
        )}

        {/* Problems Solved */}
        {stats.fullySolved !== undefined && (
          <div className="flex justify-between text-gray-400 pt-2 border-t border-yellow-600/30">
            <span>Problems</span>
            <span className="font-semibold text-yellow-400">{stats.fullySolved}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeChefStatsFaculty;
