import React from "react";
import { ChevronRight, RefreshCw } from "lucide-react";

const StudentTable = ({
  students,
  loading,
  error,
  selectedStudent,
  setSelectedStudent,
  isShowTopPerformer,
  selectedPlatform,
  handleRefetchSingleStudent,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-gray-100 dark:bg-gray-700 rounded mb-3"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500 text-red-700 dark:text-red-400">
        <p className="font-medium">Error loading student data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (students?.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No students found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {[
                { label: "Student", key: "name" },
                { label: "LeetCode", key: "leetcode" },
                { label: "HackerRank", key: "hackerrank" },
                { label: "CodeChef", key: "codechef" },
                { label: "CodeForces", key: "codeforces" },
                { label: "SkillRack", key: "skillrack" },
                { label: "GitHub", key: "github" },
                { label: "Details", key: "name" },
                { label: "Actions", key: "actions" },
              ].map(({ label, key }, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium capitalize tracking-wider cursor-pointer ${
                    selectedPlatform === key
                      ? "bg-blue-100 text-gray-1000 dark:text-gray-100 dark:bg-blue-900/30 font-bold"
                      : "text-gray-900 dark:text-gray-400"
                  }`}
                >
                  <span
                    className={`flex items-center ${
                      selectedPlatform === key
                        ? "text-blue-600 font-bold dark:text-blue-400 text-[0.9rem]"
                        : ""
                    }`}
                  >
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {students?.map((student, index) => {
              const rankBadges = ["🥇", "🥈", "🥉"];

              return (
                <tr
                  key={student._id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedStudent?._id === student._id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  } `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isShowTopPerformer && (
                        <span className="text-2xl mr-2">
                          {rankBadges[index] ?? ""}
                        </span>
                      )}
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            {student.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "leetcode"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {student.stats.leetcode?.solved?.All ?? "N/A"} solved
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.stats.leetcode?.solved?.Easy ?? 0} E |{" "}
                      {student.stats.leetcode?.solved?.Medium ?? 0} M |{" "}
                      {student.stats.leetcode?.solved?.Hard ?? 0} H
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "hackerrank"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex flex-wrap gap-1">
                      {student.stats.hackerrank?.badges
                        ?.slice(0, 3)
                        .map((badge, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          >
                            {badge.name}
                          </span>
                        ))}
                      {student.stats.hackerrank?.badges?.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          +{student.stats.hackerrank?.badges?.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "codechef"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {student.stats.codechef.fullySolved ?? "N/A"} solved
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Rating:{" "}
                      {student.stats.codechef.rating
                        ? student.stats.codechef.rating
                        : "N/A"}
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "codeforces"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      Rating:{" "}
                      {student.stats?.codeforces?.problemsSolved ?? "N/A"}
                    </div>
                    <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                      {student.stats?.codeforces?.rating ?? "N/A"}
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "skillrack"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {student.stats.skillrack?.programsSolved ?? "N/A"} solved
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Rank: {student.stats.skillrack?.rank ?? "N/A"}
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      selectedPlatform === "github"
                        ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      Commits: {student.stats.github?.totalCommits ?? "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Public Repos: {student.stats.github?.totalRepos ?? "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent?._id === student._id ? null : student
                        )
                      }
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center"
                    >
                      {selectedStudent?._id === student._id ? "Hide" : "View"}
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        handleRefetchSingleStudent(student._id);
                      }}
                      className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Refresh Student"
                    >
                      <RefreshCw size={"1.2rem"} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
