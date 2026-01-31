import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
  X,
  Award,
  TrendingUp,
  GitCommit,
  FileText,
  ExternalLink,
  RefreshCwIcon,
  Lightbulb,
  LogOut,
  Settings
} from "lucide-react";
import logo from "/algolog.png";
import ProfileModal from "../components/ProfileModal";
import { GridLoader } from "react-spinners";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DailyProblemModal from "../components/DailyProblemModal";

const LeetCodeLogo = "/icons8-leetcode-100.png";

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
  const [loading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const modalOptionsRed = useRef();
  const [leetcodeDailyProblem, setLeetcodeDailyProblem] = useState(null);
  const [showDailyProblemModal, setShowDailyProblemModal] = useState(false)

  useEffect(() => {
    const fetchDailyLeetCodeProblem = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/get-daily-leetcode-problem`
        );
        if (response.status === 200) {
          setLeetcodeDailyProblem(response.data);
        }
      } catch (error) {
        // Error fetching daily LeetCode problem, continue without it
      }
    };

    fetchDailyLeetCodeProblem();
  }, []);

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
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Hard":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return "Invalid date";
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("-");
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

  // Safe accessor helper
  const safeGet = (obj, path, defaultValue = "N/A") => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  if (!student || loading) {
    return (
      <div className="bg-[#0f172a] flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8">

      {/* Navbar */}
      <div className="flex justify-between items-center mb-12 w-full glass-card px-8 py-4 rounded-2xl sticky top-6 z-40 shadow-neo transition-all duration-300">
        <div
          onClick={() => {
            window.location.reload();
          }}
          className="flex cursor-pointer items-center group"
        >
          <img
            src={logo}
            alt="AlgoLog Logo"
            className="w-10 h-10 aspect-square group-hover:rotate-12 transition-transform duration-300"
          />
          <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-pink tracking-tight">
            AlgoLog
          </h1>
        </div>
        <div className="flex items-center relative gap-4">
          <button
            onClick={() => setIsShowModalOptions(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-100 hover:bg-dark-100/80 border border-gray-700/50 transition-all text-gray-300 hover:text-white hover:shadow-glow"
          >
            <User size={20} />
          </button>
          {isShowModalOptions && (
            <div
              ref={modalOptionsRed}
              onMouseLeave={() => setIsShowModalOptions(false)}
              className="absolute right-0 top-12 w-48 bg-dark-100 border border-gray-700/50 rounded-xl overflow-hidden z-50 animate-fadeIn"
            >
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full cursor-pointer text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
              >
                <Settings size={16} /> Profile Settings
              </button>
              <div className="h-[1px] bg-gray-700/50 mx-2"></div>
              <button
                onClick={() => handleLogout()}
                className="w-full cursor-pointer text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Profile Card */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:shadow-purple-glow transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-600/20 transition-all duration-700"></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/30 ring-4 ring-primary-500/20 group-hover:scale-105 transition-transform duration-500">
                <span className="text-5xl font-bold text-white drop-shadow-lg">
                  {student.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {student.name}
                </h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Student Performance Dashboard
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-right mr-4 hidden md:block">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Last Updated</p>
                <p className="text-sm text-gray-300 font-mono">
                  {student
                    ? new Date(student.updatedAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true
                    })
                    : "N/A"}
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isRefreshing ? 'bg-primary-600/50 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 hover:shadow-primary-500/40'}`}
              >
                <RefreshCwIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
              </button>

              <button onClick={() => setShowDailyProblemModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-700 transition-all hover:border-gray-500">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span>Daily Problem</span>
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 border-t border-gray-700/50 pt-8">
            {[
              { icon: Hash, label: "Roll No", value: student?.rollNo },
              { icon: Building, label: "Dept", value: student?.department },
              { icon: Calendar, label: "Year", value: student?.year },
              { icon: Users, label: "Section", value: student?.section },
              { icon: Mail, label: "Email", value: student?.email, colSpan: 2 }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${item.colSpan ? `lg:col-span-${item.colSpan}` : ''}`}>
                <div className="p-2 bg-dark-100/50 rounded-lg text-gray-400">
                  <item.icon size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 uppercase font-semibold">{item.label}</p>
                  <p className="text-sm font-medium text-gray-200 truncate" title={item.value}>{item.value || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LeetCode Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-orange-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={`https://leetcode.com/${student.leetcode}`} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Code className="text-white fill-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">LeetCode</h3>
                <p className="text-sm text-gray-400 lowercase">@{student.leetcode}</p>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-dark-100/50 rounded-2xl p-6 text-center border border-gray-700/50 hover:border-orange-500/30 transition-colors">
                <div className="text-3xl font-bold text-orange-400 mb-1">{safeGet(student, 'stats.leetcode.solved.All', '0')}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Solved</div>
              </div>
              <div className="flex-1 bg-dark-100/50 rounded-2xl p-6 text-center border border-gray-700/50 hover:border-primary-500/30 transition-colors">
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {student?.stats?.leetcode?.globalRanking ? `#${student.stats.leetcode.globalRanking.toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Global Rank</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {student?.stats?.leetcode?.solved &&
                Object.entries(student.stats.leetcode.solved)
                  .slice(1)
                  .filter(([_, count]) => count !== undefined && count !== null)
                  .map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center justify-between p-3 rounded-lg bg-dark-100/30 hover:bg-dark-100/60 transition-colors">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                      <span className="font-mono font-medium text-white">{count || 0}</span>
                    </div>
                  ))}
            </div>

            {student?.stats?.leetcode?.topicStats?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Top Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {[...student.stats.leetcode.topicStats]
                    .sort((a, b) => b.problemsSolved - a.problemsSolved)
                    .slice(0, 6)
                    .map((topic, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-xs text-gray-300">
                        {topic.tagName} <span className="text-blue-400 font-bold ml-1">{topic.problemsSolved}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* SkillRack Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-primary-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={student.skillrack} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">SkillRack</h3>
                <p className="text-sm text-gray-400">Rank #{student.stats?.skillrack?.rank || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-dark-100/50 rounded-2xl p-6 text-center border border-gray-700/50 mb-8">
              <div className="text-4xl font-bold text-primary-400 mb-1">{student.stats?.skillrack?.programsSolved || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Programs Solved</div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Top Languages</h4>
              <div className="space-y-3">
                {student && Object.entries(student?.stats?.skillrack?.languages || {}).slice(0, 3).map(([lang, count]) => (
                  <div key={lang} className="flex justify-between items-center p-3 rounded-lg bg-dark-100/30">
                    <span className="text-sm font-medium text-gray-300">{lang}</span>
                    <span className="text-white font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Certificates</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-custom pr-2">
                {student.stats?.skillrack?.certificates?.map((cert, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-white line-clamp-1 mr-2">{cert.title}</span>
                      <a href={cert.link} target="_blank" className="text-blue-400 hover:text-blue-300"><ExternalLink size={14} /></a>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(cert.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HackerRank Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-green-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={`https://www.hackerrank.com/profile/${student.hackerrank}`} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">HackerRank</h3>
                <p className="text-sm text-gray-400 lowercase">@{student.hackerrank}</p>
              </div>
            </div>

            <div className="space-y-4">
              {student.stats?.hackerrank?.badges?.length > 0 ? (
                student.stats.hackerrank.badges.map((badge, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-100/40 rounded-xl border border-gray-700/30 hover:border-green-500/30 transition-all">
                    <span className="font-semibold text-gray-200">{badge.name}</span>
                    <div className="flex gap-1">{renderStars(badge.stars)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 italic">No badges earned yet</div>
              )}
            </div>
          </div>

          {/* CodeChef Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={`https://www.codechef.com/users/${student.codechef}`} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">CodeChef</h3>
                <p className="text-sm text-gray-400 lowercase">@{student.codechef}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Rating", value: student.stats?.codechef?.rating, color: "text-yellow-400" },
                { label: "Highest", value: student.stats?.codechef?.highestRating, color: "text-primary-400" },
                { label: "Global Rank", value: student.stats?.codechef?.globalRank, color: "text-blue-400", prefix: "#" },
                { label: "Country Rank", value: student.stats?.codechef?.countryRank, color: "text-cyan-400", prefix: "#" },
              ].map((stat, i) => (
                <div key={i} className="bg-dark-100/50 p-4 rounded-xl text-center border border-gray-700/30">
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.prefix}{stat.value?.toLocaleString() ?? "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-dark-100/50 p-4 rounded-xl flex justify-between items-center border border-gray-700/30">
              <span className="text-gray-400 font-medium">Stars</span>
              <span className="text-yellow-400 font-bold">{student.stats?.codechef?.stars ? `${student.stats.codechef.stars} ★` : "N/A"}</span>
            </div>
          </div>

          {/* Codeforces Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-red-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={`https://codeforces.com/profile/${student.codeforces}`} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Codeforces</h3>
                <p className="text-sm text-gray-400 lowercase">@{student.codeforces}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Rating", value: student.stats?.codeforces?.rating, color: "text-red-400" },
                { label: "Max Rating", value: student.stats?.codeforces?.maxRating, color: "text-orange-400" },
                { label: "Rank", value: student.stats?.codeforces?.rank, color: "text-white" },
                { label: "Max Rank", value: student.stats?.codeforces?.maxRank, color: "text-yellow-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-dark-100/50 p-4 rounded-xl text-center border border-gray-700/30 hover:bg-dark-100/80 transition-colors">
                  <div className={`text-lg font-bold ${stat.color} truncate`}>
                    {stat.value ?? "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Card */}
          <div className="glass-card glass-card-hover border-transparent hover:border-gray-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a href={`https://github.com/${student.github}`} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={20} />
            </a>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20">
                <Github className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">GitHub</h3>
                <p className="text-sm text-gray-400 lowercase">@{student.github}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-dark-100/50 p-4 rounded-xl text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-white mb-1">{student.stats?.github?.totalRepos ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Repos</div>
              </div>
              <div className="bg-dark-100/50 p-4 rounded-xl text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-green-400 mb-1">{student.stats?.github?.totalCommits ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Commits</div>
              </div>
              <div className="bg-dark-100/50 p-4 rounded-xl text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-orange-400 mb-1">{student.stats?.github?.longestStreak ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Streak</div>
              </div>
            </div>

            {student.stats?.github?.topLanguages?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Top Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {student.stats.github.topLanguages.map((lang, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-xs text-gray-300">
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={student}
        handleUpdate={handleUpdate}
        handleChangePassword={() => setIsChangePasswordModalOpen(true)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        studentId={student._id}
      />

      <DailyProblemModal
        isOpen={showDailyProblemModal}
        onClose={() => setShowDailyProblemModal(false)}
        problem={leetcodeDailyProblem}
      />

    </div>
  );
};

export default StudentProfile;
