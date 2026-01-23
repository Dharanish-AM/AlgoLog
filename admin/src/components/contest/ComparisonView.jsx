import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
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
} from "recharts";
import { Users, GitCompare, TrendingUp, Code, Award } from "lucide-react";

const ComparisonView = () => {
  const allStudents = useSelector((state) => state.admin.allStudents);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStudents, searchTerm]);

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : prev.length < 4
        ? [...prev, studentId]
        : prev
    );
  };

  const comparisonData = useMemo(() => {
    const students = allStudents.filter((s) => selectedStudents.includes(s._id));

    // Overall stats comparison
    const overallStats = students.map((s) => ({
      name: s.name.split(" ")[0],
      Total: s.stats?.leetcode?.solved?.All || 0,
      Easy: s.stats?.leetcode?.solved?.Easy || 0,
      Medium: s.stats?.leetcode?.solved?.Medium || 0,
      Hard: s.stats?.leetcode?.solved?.Hard || 0,
      Rating: s.stats?.leetcode?.rating || 0,
      Contests: s.stats?.leetcode?.contestCount || 0,
    }));

    // Skill comparison for radar chart
    const categories = ["Array", "Dynamic Programming", "Hash Table", "String", "Tree"];
    const skillComparison = categories.map((category) => {
      const data = { subject: category };
      students.forEach((student) => {
        const topic = student.stats?.leetcode?.topicStats?.find(
          (t) => t.tagName === category
        );
        data[student.name.split(" ")[0]] = topic?.problemsSolved || 0;
      });
      return data;
    });

    return { overallStats, skillComparison };
  }, [allStudents, selectedStudents]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Student Comparison
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Compare up to 4 students side by side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
        {/* Student Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sticky top-0">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Select Students ({selectedStudents.length}/4)
            </h3>

            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.map((student, index) => {
                const isSelected = selectedStudents.includes(student._id);
                return (
                  <button
                    key={student._id}
                    onClick={() => toggleStudent(student._id)}
                    disabled={
                      !isSelected && selectedStudents.length >= 4
                    }
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${
                            index % 4 === 0
                              ? "from-blue-500/20 to-blue-600/10 border-blue-500/50"
                              : index % 4 === 1
                              ? "from-green-500/20 to-green-600/10 border-green-500/50"
                              : index % 4 === 2
                              ? "from-orange-500/20 to-orange-600/10 border-orange-500/50"
                              : "from-red-500/20 to-red-600/10 border-red-500/50"
                          }`
                        : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                    } ${
                      !isSelected && selectedStudents.length >= 4
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {student.name}
                        </div>
                        <div className="text-slate-400 text-xs font-mono">
                          {student.rollNo}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-bold text-sm">
                          {student.stats?.leetcode?.solved?.All || 0}
                        </div>
                        <div className="text-slate-500 text-xs">problems</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comparison Charts */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudents.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-12 text-center h-full flex items-center justify-center">
              <div className="max-w-md">
                <div className="bg-slate-700/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GitCompare className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Students Selected
                </h3>
                <p className="text-slate-400 mb-6">
                  Select up to 4 students from the left panel to start comparing their
                  performance.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    💡 Compare problem-solving skills, ratings, and topic expertise
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Overall Stats Comparison */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Problem Solving Stats
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comparisonData.overallStats} margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Total" fill="#3B82F6" />
                    <Bar dataKey="Easy" fill="#10B981" />
                    <Bar dataKey="Medium" fill="#F59E0B" />
                    <Bar dataKey="Hard" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rating & Contest Comparison */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Rating & Contests
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comparisonData.overallStats} margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Rating" fill="#8B5CF6" />
                    <Bar dataKey="Contests" fill="#EC4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Radar Comparison */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Topic Expertise
                </h3>
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={comparisonData.skillComparison}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" />
                    <PolarRadiusAxis stroke="#94A3B8" />
                    {allStudents
                      .filter((s) => selectedStudents.includes(s._id))
                      .map((student, index) => (
                        <Radar
                          key={student._id}
                          name={student.name.split(" ")[0]}
                          dataKey={student.name.split(" ")[0]}
                          stroke={COLORS[index]}
                          fill={COLORS[index]}
                          fillOpacity={0.3}
                        />
                      ))}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allStudents
                  .filter((s) => selectedStudents.includes(s._id))
                  .map((student, index) => (
                    <div
                      key={student._id}
                      className={`bg-gradient-to-br rounded-xl border p-4 ${
                        index === 0
                          ? "from-blue-500/10 to-blue-600/5 border-blue-500/20"
                          : index === 1
                          ? "from-green-500/10 to-green-600/5 border-green-500/20"
                          : index === 2
                          ? "from-orange-500/10 to-orange-600/5 border-orange-500/20"
                          : "from-red-500/10 to-red-600/5 border-red-500/20"
                      }`}
                    >
                      <h4 className="text-white font-bold mb-3 truncate">
                        {student.name}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total:</span>
                          <span className="text-white font-semibold">
                            {student.stats?.leetcode?.solved?.All || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rating:</span>
                          <span className="text-white font-semibold">
                            {Math.round(student.stats?.leetcode?.rating || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Contests:</span>
                          <span className="text-white font-semibold">
                            {student.stats?.leetcode?.contestCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Streak:</span>
                          <span className="text-white font-semibold">
                            {student.stats?.leetcode?.streak || 0} days
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
