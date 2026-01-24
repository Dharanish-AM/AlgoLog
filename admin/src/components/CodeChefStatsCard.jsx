import React from "react";
import { Award, TrendingUp, Globe } from "lucide-react";

const CodeChefStatsCard = ({ student }) => {
  const stats = student?.stats?.codechef;

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-900/5 rounded-lg p-4 border border-yellow-700/30">
        <div className="text-center text-gray-400 text-sm">
          No CodeChef data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-900/5 rounded-lg p-4 border border-yellow-700/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-yellow-700/30">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-yellow-400">CodeChef Stats</span>
        </div>
        {stats.division && (
          <span className="text-xs bg-yellow-700/40 text-yellow-300 px-2 py-1 rounded">
            {stats.division}
          </span>
        )}
      </div>

      {/* Rating Section */}
      {stats.rating && (
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-gray-300 text-sm">Rating</span>
            <span className="text-2xl font-bold text-yellow-400">
              {stats.rating}
            </span>
          </div>
          {stats.highestRating && (
            <div className="text-xs text-gray-400 mt-1">
              Highest: <span className="text-purple-300">{stats.highestRating}</span>
            </div>
          )}
        </div>
      )}

      {/* Ranks */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.globalRank && (
          <div className="bg-blue-900/30 rounded p-2">
            <div className="text-xs text-gray-400">Global Rank</div>
            <div className="text-sm font-semibold text-blue-400">
              #{stats.globalRank.toLocaleString()}
            </div>
          </div>
        )}
        {stats.countryRank && (
          <div className="bg-cyan-900/30 rounded p-2">
            <div className="text-xs text-gray-400">Country Rank</div>
            <div className="text-sm font-semibold text-cyan-400">
              #{stats.countryRank.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Problems Solved */}
      {stats.fullySolved !== undefined && (
        <div className="bg-yellow-900/30 rounded p-2 mb-3">
          <div className="text-xs text-gray-400">Problems Solved</div>
          <div className="text-lg font-bold text-yellow-400">
            {stats.fullySolved}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeChefStatsCard;
