import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Code,
  Target,
  Award,
  Activity,
  Brain,
  Zap,
  Calendar,
} from "lucide-react";

const AnalyticsView = () => {
  const allStudents = useSelector((state) => state.admin.allStudents);
  const [selectedMetric, setSelectedMetric] = useState("topics");

  // Calculate difficulty distribution across all students
  const difficultyDistribution = useMemo(() => {
    const totals = { Easy: 0, Medium: 0, Hard: 0 };
    allStudents.forEach((student) => {
      const solved = student.stats?.leetcode?.solved;
      if (solved) {
        totals.Easy += solved.Easy || 0;
        totals.Medium += solved.Medium || 0;
        totals.Hard += solved.Hard || 0;
      }
    });
    return [
      { name: "Easy", value: totals.Easy, color: "#10B981" },
      { name: "Medium", value: totals.Medium, color: "#F59E0B" },
      { name: "Hard", value: totals.Hard, color: "#EF4444" },
    ];
  }, [allStudents]);

  // Top 10 topics by total problems solved
  const topTopics = useMemo(() => {
    const topicMap = {};
    allStudents.forEach((student) => {
      student.stats?.leetcode?.topicStats?.forEach((topic) => {
        if (!topicMap[topic.tagName]) {
          topicMap[topic.tagName] = 0;
        }
        topicMap[topic.tagName] += topic.problemsSolved;
      });
    });
    return Object.entries(topicMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [allStudents]);

  // Language distribution
  const languageDistribution = useMemo(() => {
    const langMap = {};
    allStudents.forEach((student) => {
      student.stats?.leetcode?.languageStats?.forEach((lang) => {
        if (!langMap[lang.languageName]) {
          langMap[lang.languageName] = 0;
        }
        langMap[lang.languageName] += lang.problemsSolved;
      });
    });
    return Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [allStudents]);

  // Student performance tiers
  const performanceTiers = useMemo(() => {
    const tiers = { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 };
    allStudents.forEach((student) => {
      const total = student.stats?.leetcode?.solved?.All || 0;
      if (total < 50) tiers.Beginner++;
      else if (total < 100) tiers.Intermediate++;
      else if (total < 200) tiers.Advanced++;
      else tiers.Expert++;
    });
    return Object.entries(tiers).map(([name, value]) => ({ name, value }));
  }, [allStudents]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const ranges = {
      "Unrated": 0,
      "1200-1400": 0,
      "1400-1600": 0,
      "1600-1800": 0,
      "1800-2000": 0,
      "2000+": 0,
    };
    allStudents.forEach((student) => {
      const rating = student.stats?.leetcode?.rating || 0;
      if (rating === 0) ranges["Unrated"]++;
      else if (rating < 1400) ranges["1200-1400"]++;
      else if (rating < 1600) ranges["1400-1600"]++;
      else if (rating < 1800) ranges["1600-1800"]++;
      else if (rating < 2000) ranges["1800-2000"]++;
      else ranges["2000+"]++;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [allStudents]);

  // Top 5 skill categories for radar chart
  const skillRadarData = useMemo(() => {
    const categories = [
      "Array",
      "Dynamic Programming",
      "Hash Table",
      "String",
      "Tree",
      "Graph",
    ];
    const avgByCategory = categories.map((category) => {
      const total = allStudents.reduce((sum, student) => {
        const topic = student.stats?.leetcode?.topicStats?.find(
          (t) => t.tagName === category
        );
        return sum + (topic?.problemsSolved || 0);
      }, 0);
      return {
        subject: category,
        value: allStudents.length > 0 ? Math.round(total / allStudents.length) : 0,
        fullMark: 30,
      };
    });
    return avgByCategory;
  }, [allStudents]);

  // Activity over years
  const activityByYear = useMemo(() => {
    const yearMap = {};
    allStudents.forEach((student) => {
      student.stats?.leetcode?.activeYears?.forEach((year) => {
        yearMap[year] = (yearMap[year] || 0) + 1;
      });
    });
    return Object.entries(yearMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, students: count }));
  }, [allStudents]);

  const COLORS = [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#6366F1",
    "#EF4444",
  ];

  const metrics = [
    { id: "topics", label: "Topics Analysis", icon: Brain },
    { id: "difficulty", label: "Difficulty Mix", icon: Target },
    { id: "languages", label: "Languages", icon: Code },
    { id: "performance", label: "Performance Tiers", icon: Award },
    { id: "rating", label: "Rating Distribution", icon: TrendingUp },
    { id: "skills", label: "Skill Radar", icon: Zap },
    { id: "activity", label: "Activity Trends", icon: Activity },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Advanced Analytics
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Deep insights into student performance and trends
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-blue-400" />
            <p className="text-slate-400 text-sm">Total Problems</p>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {allStudents.reduce(
              (sum, s) => sum + (s.stats?.leetcode?.solved?.All || 0),
              0
            )}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <p className="text-slate-400 text-sm">Avg Rating</p>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {allStudents.length > 0
              ? Math.round(
                  allStudents.reduce(
                    (sum, s) => sum + (s.stats?.leetcode?.rating || 0),
                    0
                  ) / allStudents.filter((s) => s.stats?.leetcode?.rating > 0).length || 1
                )
              : 0}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-slate-400 text-sm">Active Coders</p>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {
              allStudents.filter((s) => (s.stats?.leetcode?.streak || 0) > 0)
                .length
            }
          </h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <p className="text-slate-400 text-sm">Total Contests</p>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {allStudents.reduce(
              (sum, s) => sum + (s.stats?.leetcode?.contestCount || 0),
              0
            )}
          </h3>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedMetric === metric.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <metric.icon className="w-4 h-4" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Charts Area */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-auto min-h-[600px]">
        {selectedMetric === "topics" && (
          <div className="h-full">
            <h3 className="text-xl font-bold text-white mb-6">
              🎯 Top 10 Problem Topics
            </h3>
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={topTopics} margin={{ top: 20, right: 30, bottom: 150, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  angle={-45}
                  textAnchor="end"
                  height={140}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {topTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === "difficulty" && (
          <div className="h-full">
            <h3 className="text-xl font-bold text-white mb-6">
              📈 Difficulty Distribution
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={140}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-5 flex flex-col justify-center">
                {difficultyDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="bg-gradient-to-br from-slate-700/50 to-slate-800/30 p-5 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">{item.name}</span>
                      <span className="text-3xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${
                            (item.value /
                              difficultyDistribution.reduce((s, i) => s + i.value, 0)) *
                            100
                          }%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.color}40`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedMetric === "languages" && (
          <div className="h-full">
            <h3 className="text-xl font-bold text-white mb-6">
              💻 Programming Language Usage
            </h3>
            <ResponsiveContainer width="100%" height={550}>
              <BarChart data={languageDistribution} layout="vertical" margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "#334155" }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 8, 8, 0]} animationDuration={800}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === "performance" && (
          <div className="h-full flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-white mb-6 self-start">
              🏆 Performance Tiers
            </h3>
            <ResponsiveContainer width="100%" height={550}>
              <PieChart>
                <Pie
                  data={performanceTiers}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={160}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {performanceTiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === "rating" && (
          <div className="h-full">
            <h3 className="text-xl font-bold text-white mb-6">
              ⭐ Rating Distribution
            </h3>
            <ResponsiveContainer width="100%" height={550}>
              <BarChart data={ratingDistribution} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" angle={-15} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "#334155" }}
                />
                <Bar dataKey="value" fill="#EC4899" radius={[8, 8, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === "skills" && (
          <div className="h-full flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-white mb-6 self-start">
              ⚡ Average Skill Distribution
            </h3>
            <ResponsiveContainer width="100%" height={550}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis stroke="#94A3B8" angle={90} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.7}
                  strokeWidth={2}
                  animationDuration={800}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === "activity" && (
          <div className="h-full">
            <h3 className="text-xl font-bold text-white mb-6">
              📅 Student Activity Over Years
            </h3>
            <ResponsiveContainer width="100%" height={550}>
              <LineChart data={activityByYear} margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ fill: "#06B6D4", r: 6, strokeWidth: 2, stroke: "#1E293B" }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
