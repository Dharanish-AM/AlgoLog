import React, { useEffect, useRef, useState } from "react";
import {
  Edit2,
  Save,
  User,
  Mail,
  Hash,
  Building,
  Users,
  Calendar,
  Github,
  Code,
  Trophy,
  Star,
  Award,
  TrendingUp,
  GitCommit,
  FileText,
  ExternalLink,
  RefreshCwIcon,
} from "lucide-react";
import logo from "/algolog.png";
import ProfileModal from "../components/ProfileModal";
import { GridLoader } from "react-spinners";
import ChangePasswordModal from "../components/ChangePasswordModal";

const StudentProfile = ({
  student,
  handleLogout,
  handleRefresh,
  isRefreshing,
  handleUpdate,
  handleUpdatePassword,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShowModalOptions, setIsShowModalOptions] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const modalOptionsRed = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalOptionsRed.current &&
        !modalOptionsRed.current.contains(event.target)
      ) {
        setIsShowModalOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const renderStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return "Invalid date";

    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("-");

    // Handle missing time
    const time = timePart || "00:00";

    const isoFormat = `${year}-${month}-${day}T${time}`;

    const date = new Date(isoFormat);

    if (isNaN(date)) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (!student) {
    return (
      <div className="bg-[#161F2D] flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 w-full">
        <div
          onClick={() => {
            window.location.reload();
          }}
          className="flex cursor-pointer items-center"
        >
          <img
            src={logo}
            alt="AlgoLog Logo"
            className="w-10 h-10 aspect-square"
          />
          <h1 className="ml-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            AlgoLog
          </h1>
        </div>
        <div className="flex items-center relative gap-4">
          <button
            onClick={() => setIsShowModalOptions(true)}
            className="flex border cursor-pointer border-gray-500 items-center gap-2 p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <User
              size={"1.5rem"}
              className="text-gray-400 dark:text-gray-300"
            />
          </button>
          {isShowModalOptions && (
            <div
              ref={modalOptionsRed}
              onMouseLeave={() => setIsShowModalOptions(false)}
              className="absolute right-4 top-14 w-48 bg-gray-800 rounded-xl shadow-lg ring-1 ring-black/10 z-50 p-2"
            >
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full cursor-pointer text-left px-4 py-2 text-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Profile
              </button>
              <button
                onClick={() => handleLogout()}
                className="w-full cursor-pointer text-left px-4 py-2 text-md text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 aspect-square h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold ">
                  {student.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl flex-wrap font-bold text-white">
                  {student.name}
                </h1>
                <p className="text-gray-400">Student Performance Dashboard</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-sm text-gray-400">
                Last Updated:{" "}
                {student
                  ? new Date(student.updatedAt).toLocaleString("en-US", {
                      weekday: "short", // e.g. 'Tue'
                      year: "numeric",
                      month: "short", // e.g. 'May'
                      day: "numeric", // e.g. '11'
                      hour: "numeric", // e.g. '1'
                      minute: "numeric", // e.g. '30'
                      second: "numeric", // e.g. '45'
                      hour12: true, // 12-hour time format
                    })
                  : "N/A"}
              </div>
              {isRefreshing ? (
                <button
                  disabled
                  onClick={handleRefresh}
                  className="flex justify-center items-center w-full sm:w-fit sm:h-fit space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg"
                >
                  <RefreshCwIcon className="w-5 h-5 animate-spin" />
                  <span>Refreshing...</span>
                </button>
              ) : (
                <button
                  onClick={handleRefresh}
                  className="flex justify-center items-center w-full sm:w-fit sm:h-fit space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <RefreshCwIcon className="w-5 h-5" />
                  <span>Refresh</span>
                </button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <User className="w-4 h-4" />
                <span>Name</span>
              </label>

              <p className="text-white font-medium">{student.name}</p>
            </div>

            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>

              <p className="text-white break-words">{student.email}</p>
            </div>

            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Hash className="w-4 h-4" />
                <span>Roll Number</span>
              </label>

              <p className="text-white font-mono">{student.rollNo}</p>
            </div>

            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Building className="w-4 h-4" />
                <span>Department</span>
              </label>

              <p className="text-white">{student.department}</p>
            </div>

            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Users className="w-4 h-4" />
                <span>Section</span>
              </label>

              <p className="text-white">{student.section}</p>
            </div>

            <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Year</span>
              </label>

              <p className="text-white">{student.year}</p>
            </div>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LeetCode */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={`https://leetcode.com/${student.leetcode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">LeetCode</h3>
                <p className="text-sm text-gray-400">@{student.leetcode}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-blue-400">
                  {student.stats?.leetcode?.solved?.All}
                </div>
                <div className="text-sm text-gray-400">Total Solved</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-white">
                  {student.stats.leetcode.rating}
                </div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(student.stats.leetcode.solved)
                .slice(1)
                .map(([difficulty, count]) => (
                  <div
                    key={difficulty}
                    className="flex py-3 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 justify-between items-center"
                  >
                    <span
                      className={`rounded-full text-sm font-medium ${getDifficultyColor(
                        difficulty
                      )}`}
                    >
                      {difficulty}
                    </span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* HackerRank */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={`https://www.hackerrank.com/profile/${student.hackerrank}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">HackerRank</h3>
                <p className="text-sm text-gray-400">@{student.hackerrank}</p>
              </div>
            </div>
            <div className="space-y-3">
              {student.stats.hackerrank.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <span className="text-gray-200 font-medium">
                    {badge.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    {renderStars(badge.stars)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CodeChef */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={`https://www.codechef.com/users/${student.codechef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">CodeChef</h3>
                <p className="text-sm text-gray-400">@{student.codechef}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-yellow-400">
                  {student.stats.codechef.fullySolved}
                </div>
                <div className="text-sm text-gray-400">Fully Solved</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-white">
                  {student.stats.codechef.rating || "N/A"}
                </div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
          </div>

          {/* Codeforces */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={`https://codeforces.com/profile/${student.codeforces}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Codeforces</h3>
                <p className="text-sm text-gray-400">@{student.codeforces}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-lg font-bold text-red-400">
                  {student.stats.codeforces.rating}
                </div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-lg font-bold text-white">
                  {student.stats.codeforces.rank}
                </div>
                <div className="text-sm text-gray-400">Rank</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-lg font-bold text-blue-400">
                  {student.stats.codeforces.contests}
                </div>
                <div className="text-sm text-gray-400">Contests</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-lg font-bold text-green-400">
                  {student.stats.codeforces.problemsSolved}
                </div>
                <div className="text-sm text-gray-400">Problems</div>
              </div>
            </div>
          </div>

          {/* Skillrack */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={student.skillrack}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Skillrack</h3>
                <p className="text-sm text-gray-400">
                  Rank #{student.stats.skillrack.rank}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center flex-col mb-4 py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {student.stats.skillrack.programsSolved}
              </div>
              <div className="text-sm text-gray-400">Programs Solved</div>
            </div>
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-white">Top Languages</h4>
              {Object.entries(student?.stats?.skillrack?.languages || {})
                .slice(0, 3)
                .map(([lang, count]) => (
                  <div key={lang} className="flex justify-between items-center">
                    <span className="text-gray-200 text-sm">{lang}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Certificates</h4>
              {student.stats.skillrack.certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-700 py-4 px-6 rounded-lg hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200 text-sm font-medium">
                      {cert.title}
                    </span>
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(cert.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub */}
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative w-full">
            <a
              href={`https://github.com/${student.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-gray-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GitHub</h3>
                <p className="text-sm text-gray-400">@{student.github}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-white">
                  {student.stats.github.totalCommits}
                </div>
                <div className="text-sm text-gray-400">Total Commits</div>
              </div>
              <div className="text-center py-4 bg-gray-700 rounded-lg hover:bg-gray-600">
                <div className="text-2xl font-bold text-blue-400">
                  {student.stats.github.totalRepos}
                </div>
                <div className="text-sm text-gray-400">Repositories</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Top Languages</h4>
              <div className="flex flex-wrap gap-2">
                {student.stats.github.topLanguages
                  .slice(0, 6)
                  .map((lang, index) => (
                    <span
                      key={index}
                      className="px-4 py-3 items-center justify-center flex flex-1 bg-gray-700 text-gray-200 text-xs rounded-full hover:bg-gray-600"
                    >
                      {lang.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          student={student}
          handleUpdate={handleUpdate}
          handleChangePassword={() => {
            setIsProfileModalOpen(false);
            setIsChangePasswordModalOpen(true);
          }}
        />
      )}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordModalOpen(false)}
          student={student}
          handleUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  );
};

export default StudentProfile;
