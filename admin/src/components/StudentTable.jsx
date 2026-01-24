import React, { useState, useEffect } from "react";
import { ChevronRight, RefreshCw, X } from "lucide-react";
import { Search } from "lucide-react";
import StudentCard from "./StudentCard";

const StudentTable = ({ students, handleRefetchSingleStudent }) => {
  const [refreshingMap, setRefreshingMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(
    students ? students : []
  );
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isShowTopPerformer, setIsShowTopPerformer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getScore = (student) => {
      const stats = student?.stats?.[selectedPlatform?.toLowerCase?.() || ""];
      if (!stats) return -1;

      switch (selectedPlatform?.toLowerCase?.() || "") {
        case "leetcode":
          return stats.solved?.All || 0;
        case "hackerrank":
          return stats.badges?.length || 0;
        case "codechef":
          return stats?.fullySolved || 0;
        case "codeforces":
          return stats?.problemsSolved || 0;
        case "skillrack":
          return stats?.programsSolved || 0;
        case "github":
          return stats?.totalCommits || 0;
        default:
          return 0;
      }
    };

    const getTotalScore = (student) => {
      const platforms = [
        "leetcode",
        "hackerrank",
        "codechef",
        "codeforces",
        "skillrack",
        "github",
      ];
      return platforms.reduce((total, platform) => {
        const stats = student.stats?.[platform];
        switch (platform) {
          case "leetcode":
            return total + (stats?.solved?.All || 0);
          case "hackerrank":
            return total + (stats?.badges?.length || 0);
          case "codechef":
            return total + (stats?.fullySolved || 0);
          case "codeforces":
            return total + (stats?.problemsSolved || 0);
          case "skillrack":
            return total + (stats?.programsSolved || 0);
          case "github":
            return total + (stats?.totalCommits || 0);
          default:
            return total;
        }
      }, 0);
    };

    let result = students ? [...students] : [];

    if (searchTerm) {
      const term = searchTerm?.toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase()?.includes(term) ||
          student.rollNo?.toLowerCase()?.includes(term)
      );
    }

    if (isShowTopPerformer) {
      result = result
        .filter((student) => getTotalScore(student) > 0)
        .sort((a, b) => {
          const scoreDiff = getTotalScore(b) - getTotalScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          const nameA = a.name?.toLowerCase() || "";
          const nameB = b.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        });
    } else {
      result.sort((a, b) => {
        if (selectedPlatform !== "all") {
          const scoreDiff = getScore(b) - getScore(a);
          if (scoreDiff !== 0) return scoreDiff;
        }
        return a.rollNo?.localeCompare(b.rollNo || "");
      });
    }

    setFilteredStudents(result);

    if (selectedStudent && !result.find((s) => s._id === selectedStudent._id)) {
      setSelectedStudent(null);
    }
  }, [
    students,
    searchTerm,
    selectedStudent,
    selectedPlatform,
    isShowTopPerformer,
  ]);

  const handleRefreshClick = async (studentId) => {
    setRefreshingMap((prev) => ({ ...prev, [studentId]: true }));
    await handleRefetchSingleStudent(studentId);
    setRefreshingMap((prev) => ({ ...prev, [studentId]: false }));
  };

  const onShowTopPerformer = () => {
    setIsShowTopPerformer(!isShowTopPerformer);
  };

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

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-row items-center justify-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 text-sm dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
          Total Students: {students?.length ? students.length : 0}
        </div>
        <div className="relative flex-row flex flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              if (isShowTopPerformer) {
                setIsShowTopPerformer(false);
              }
              setSearchTerm(e.target.value);
            }}
            placeholder="Search students..."
            className="pl-11 pr-10 py-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <X
                size={18}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              />
            </button>
          )}
        </div>

        <div className="flex-shrink-0">
          <select
            value={selectedPlatform || ""}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
          >
            <option value={"all"}>All Platforms</option>
            <option value={"leetcode"}>LeetCode</option>
            <option value={"hackerrank"}>HackerRank</option>
            <option value={"codechef"}>CodeChef</option>
            <option value={"codeforces"}>Codeforces</option>
            <option value={"skillrack"}>SkillRack</option>
            <option value={"github"}>GitHub</option>
          </select>
        </div>
        <button
          onClick={onShowTopPerformer}
          className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all text-sm font-medium"
        >
          Top Performers
        </button>
      </div>
      {filteredStudents?.length === 0 ? (
        <div className="bg-white mt-6 dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
          <p>No students found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 mt-6 rounded-lg shadow-md">
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
              {filteredStudents?.map((student, index) => {
                if (!student || !student._id) return null;
                const rankBadges = ["🥇", "🥈", "🥉"];
                const borderColor = [
                  { border: "2px solid #FFD700" }, // Gold border for 1st
                  { border: "2px solid #C0C0C0" }, // Silver border for 2nd
                  { border: "2px solid #CD7F32" }, // Bronze border for 3rd
                ];

                const backgroundClass = index < 3 ? borderColor[index] : {};

                return (
                  <tr
                    key={student._id}
                    style={{
                      ...backgroundClass,
                      ...(!isShowTopPerformer
                        ? {
                            border: "none",
                          }
                        : {}),
                    }}
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
                        {student.stats.codechef?.fullySolved ?? "N/A"} solved
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Rating:{" "}
                        {student.stats.codechef?.rating
                          ? student.stats.codechef.rating
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {student.stats.codechef?.globalRank ? (
                          <>Rank: {student.stats.codechef.globalRank}</>,
                        ) : null}
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
                        {student.stats?.codeforces?.problemsSolved ?? "N/A"}{" "}
                        solved
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
                        {student.stats.skillrack?.programsSolved ?? "N/A"}{" "}
                        solved
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
                        Public Repos:{" "}
                        {student.stats.github?.totalRepos ?? "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          setSelectedStudent(
                            selectedStudent?._id === student._id
                              ? null
                              : student
                          )
                        }
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center"
                      >
                        {selectedStudent?._id === student?._id
                          ? "Hide"
                          : "View"}
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRefreshClick(student._id)}
                        className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
                        title="Refresh Student"
                      >
                        <RefreshCw
                          size="1.2rem"
                          className={
                            refreshingMap[student._id]
                              ? "animate-spin text-purple-400"
                              : ""
                          }
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedStudent && (
            <StudentCard
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentTable;
