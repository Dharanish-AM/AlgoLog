import React, { useState } from "react";
import { Award, Code, Trophy, Star, X, Link } from "lucide-react";
import EditStudentModal from "./EditStudentModal";
import axios from "axios";

const StudentCard = ({ student, onClose, reFetchStudents }) => {
  const {
    name,
    leetcode,
    hackerrank,
    codechef,
    codeforces,
    skillrack,
    github,
  } = student.stats;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(student);

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    console.log("Delete student:", student);
  };

  const handleEditStudent = async (updatedData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/students/${student._id}`,
        updatedData
      );
      if (response?.status === 200 || response?.status === 201) {
        setIsEditOpen(false);
        reFetchStudents();
        toast.success("Student added successfully!");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const leetcodeTotal =
    (leetcode?.solved?.Easy || 0) +
    (leetcode?.solved?.Medium || 0) +
    (leetcode?.solved?.Hard || 0);
  const leetcodePercentage = Math.min(
    100,
    Math.round((leetcodeTotal / 3525) * 100)
  );

  return (
    <>
      {isEditOpen ? (
        <EditStudentModal
          isOpen={true}
          onClose={handleCancelEdit}
          onSave={(updatedData) => {
            handleEditStudent(updatedData);
          }}
          student={selectedStudent}
        />
      ) : (
        <div className="overflow-auto scrollbar-hide bg-gradient-radial min-w-[45vw] h-[90vh] from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-lg overflow-auto transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-800 to-secondary-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm"></div>
            <div className="relative flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm border-2 border-white/30 shadow-xl transform hover:scale-105 transition-transform">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <span className="text-[1.7rem] font-medium text-gray-600 dark:text-gray-300">
                    {student.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
                <p className="text-blue-100 text-sm">
                  {student.name} | {student.department} | {student.year}
                </p>
                <p className="text-blue-100 font-medium">
                  Competitive Programming Profile
                </p>
              </div>
              <X
                onClick={() => {
                  onClose();
                }}
                color="#fff"
                size={24}
                className="absolute top-2 right-2 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col gap-8 p-8">
            <div className="space-y-6 border border-gray-700 bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Code size={24} className="text-primary-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  LeetCode
                </h4>
                <a
                  href={`https://leetcode.com/${student.leetcode || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary-500 hover:text-primary-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Problems Solved:
                  </span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {leetcodeTotal}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    style={{ width: `${leetcodePercentage}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                      Easy
                    </div>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {leetcode?.solved?.Easy ?? "N/A"}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                      Medium
                    </div>
                    <div className="font-bold text-yellow-600 dark:text-yellow-400">
                      {leetcode?.solved?.Medium ?? "N/A"}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                      Hard
                    </div>
                    <div className="font-bold text-red-600 dark:text-red-400">
                      {leetcode?.solved?.Hard ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 bg-white/50 border border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Code size={24} className="text-purple-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  SkillRack
                </h4>
                <a
                  href={`${student.skillrack || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-purple-500 hover:text-purple-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Languages
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {skillrack?.languages ? (
                      Object.entries(skillrack.languages).map(
                        ([language, count]) => (
                          <div
                            key={language}
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-center"
                          >
                            <div className="font-semibold text-gray-800 dark:text-white">
                              {language}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {count} solved
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-sm text-gray-500">N/A</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rank
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {skillrack?.rank ?? "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Total Programs Solved
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {skillrack?.programsSolved ?? "N/A"}
                  </span>
                </div>

                {skillrack?.certificates?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Certificates
                    </div>
                    {skillrack.certificates.slice(0, 3).map((certificate) => (
                      <div
                        key={certificate._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <Award size={20} className="text-purple-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {certificate.title}
                          </span>
                        </div>
                        <a
                          href={certificate.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 dark:text-purple-400 text-sm ml-2"
                        >
                          View Certificate
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6 bg-white/50 border border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-secondary-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  HackerRank
                </h4>
                <a
                  href={`https://www.hackerrank.com/${student.hackerrank || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-secondary-500 hover:text-secondary-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600 dark:text-gray-300">
                    Top Badges:
                  </span>
                  <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                    {hackerrank?.badges?.length ?? "N/A"}
                  </span>
                </div>
                <div className="space-y-2">
                  {hackerrank?.badges?.length > 0 ? (
                    hackerrank.badges.slice(0, 5).map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-700/50 p-3 rounded-lg transform hover:scale-102 transition-transform"
                      >
                        <div className="flex items-center gap-3">
                          <Award size={20} className="text-secondary-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {badge.name}
                          </span>
                        </div>
                        <div className="flex gap-[2px]">
                          {Array.from({ length: badge.stars }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">N/A</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-white/50 border border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Star size={24} className="text-orange-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  CodeChef
                </h4>
                <a
                  href={`https://www.codechef.com/users/${student.codechef || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-orange-500 hover:text-orange-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rating
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {codechef?.rating & "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Problems Solved
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {codechef?.fullySolved ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rank
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {codechef?.rank ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-6 bg-white/50 border border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Code size={24} className="text-blue-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Codeforces
                </h4>
                <a
                  href={`https://codeforces.com/profile/${student.codeforces || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Problems Solved
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {codeforces?.problemsSolved ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rating
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {codeforces?.rating ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rank
                  </span>
                  <span
                    className={`font-semibold capitalize ${getRankColor(
                      codeforces?.rank ?? ""
                    )}`}
                  >
                    {codeforces?.rank ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Contests
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {codeforces?.contests ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-6 bg-white/50 border border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-secondary-500" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  GitHub
                </h4>
                <a
                  href={`https://github.com/${student.github || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-secondary-500 hover:text-secondary-700"
                >
                  <Link size={18} />
                </a>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Commits:
                  </span>
                  <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                    {github?.totalCommits ?? "N/A"}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600 dark:text-gray-300">
                    Public Repository:
                  </span>
                  <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                    {github?.totalRepos ?? "N/A"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm mb-4 font-medium text-gray-600 dark:text-gray-300">
                    Top Languages
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {github?.topLanguages ? (
                      github.topLanguages.map((language, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-center"
                        >
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {language.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">N/A</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm flex justify-end gap-4 px-8 pb-6">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-800 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
            >
              Edit Student
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 focus:outline-none"
            >
              Delete Student
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const getRankColor = (rank) => {
  const rankLower = rank?.toLowerCase();

  if (rankLower?.includes("newbie")) return "text-gray-500";
  if (rankLower?.includes("pupil")) return "text-green-500";
  if (rankLower?.includes("specialist")) return "text-cyan-500";
  if (rankLower?.includes("expert")) return "text-blue-500";
  if (rankLower?.includes("candidate master")) return "text-purple-500";
  if (rankLower?.includes("master")) return "text-orange-500";
  if (rankLower?.includes("grandmaster")) return "text-red-500";
  if (rankLower?.includes("international")) return "text-red-600";
  if (rankLower?.includes("legendary")) return "text-red-700";

  return "text-gray-700 dark:text-gray-300";
};

export default StudentCard;
