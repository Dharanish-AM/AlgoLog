import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { getClasses, getDepartments } from "../services/adminOperations";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChevronRight } from "lucide-react";
import StudentCard from "../components/StudentCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Chart() {
  const [selectedChart, setSelectedChart] = useState("class");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [topPerformers, setTopPerformers] = useState([]);
  const [showCharts, setShowCharts] = useState(true);
  const departments = useSelector((state) => state.admin.departments);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const classes = useSelector((state) => state.admin.classes);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const onShowTopPerformer = () => {
    const allStudents = classes.flatMap((cls) =>
      cls.students.map((student) => ({
        ...student,
        className: cls.username || cls.name,
        totalScore: getTotalScore(student),
      }))
    );

    const sorted = allStudents
      .filter((s) => s.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10); // top 10

    setTopPerformers(sorted);
    setShowCharts(false);
  };

  useEffect(() => {
    fetchDepartments();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    await getClasses(token, dispatch);
  };

  const fetchDepartments = async () => {
    await getDepartments(token, dispatch);
  };

  const getScore = (student) => {
    const stats = student.stats?.[selectedPlatform.toLowerCase()];
    if (!stats) return 0;

    switch (selectedPlatform.toLowerCase()) {
      case "leetcode":
        return stats.solved?.All || stats.solved?.total || 0;
      case "hackerrank":
        return stats.badges?.length || 0;
      case "codechef":
        return stats.fullySolved || 0;
      case "codeforces":
        return stats.problemsSolved || 0;
      case "skillrack":
        return stats.programsSolved || 0;
      case "github":
        return stats.totalCommits || 0;
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
          return total + (stats?.solved?.All || stats?.solved?.total || 0);
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

  // Chart data: Classes
  const classPerformance = classes.map((cls) => {
    const total = cls.students?.reduce((acc, student) => {
      return (
        acc +
        (selectedPlatform === "all"
          ? getTotalScore(student)
          : getScore(student))
      );
    }, 0);
    return {
      name: cls.username || cls.name,
      totalSolved: total,
    };
  });

  const classChartData = {
    labels: classPerformance.map((c) => c.name),
    datasets: [
      {
        label: `Score by Class (${selectedPlatform})`,
        data: classPerformance.map((c) => c.totalSolved),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const departmentPerformance = departments?.map((dept) => {
    let total = 0;
    let studentCount = 0;

    classes.forEach((cls) => {
      if (cls.department === dept._id) {
        cls.students?.forEach((student) => {
          total +=
            selectedPlatform === "all"
              ? getTotalScore(student)
              : getScore(student);
          studentCount++;
        });
      }
    });

    return {
      name: dept.name,
      avgSolved: studentCount ? Math.round(total / studentCount) : 0,
    };
  });

  const departmentChartData = {
    labels: departmentPerformance?.map((d) => d.name),
    datasets: [
      {
        label: `Average Score by Department (${selectedPlatform})`,
        data: departmentPerformance?.map((d) => d.avgSolved),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const getPlatformBreakdownForClass = (cls) => {
    const platforms = [
      "leetcode",
      "hackerrank",
      "codechef",
      "codeforces",
      "skillrack",
      "github",
    ];
    return platforms.map((platform) => {
      const value = cls.students?.reduce((acc, student) => {
        const stats = student.stats?.[platform];
        switch (platform) {
          case "leetcode":
            return acc + (stats?.solved?.All || stats?.solved?.total || 0);
          case "hackerrank":
            return acc + (stats?.badges?.length || 0);
          case "codechef":
            return acc + (stats?.fullySolved || 0);
          case "codeforces":
            return acc + (stats?.problemsSolved || 0);
          case "skillrack":
            return acc + (stats?.programsSolved || 0);
          case "github":
            return acc + (stats?.totalCommits || 0);
          default:
            return acc;
        }
      }, 0);
      return { platform, value };
    });
  };

  const getPlatformBreakdownForDepartment = (deptId) => {
    const platforms = [
      "leetcode",
      "hackerrank",
      "codechef",
      "codeforces",
      "skillrack",
      "github",
    ];
    let studentList = [];
    classes.forEach((cls) => {
      if (cls.department === deptId) {
        studentList = [...studentList, ...(cls.students || [])];
      }
    });
    return platforms.map((platform) => {
      const total = studentList.reduce((acc, student) => {
        const stats = student.stats?.[platform];
        switch (platform) {
          case "leetcode":
            return acc + (stats?.solved?.All || stats?.solved?.total || 0);
          case "hackerrank":
            return acc + (stats?.badges?.length || 0);
          case "codechef":
            return acc + (stats?.fullySolved || 0);
          case "codeforces":
            return acc + (stats?.problemsSolved || 0);
          case "skillrack":
            return acc + (stats?.programsSolved || 0);
          case "github":
            return acc + (stats?.totalCommits || 0);
          default:
            return acc;
        }
      }, 0);
      const avg = studentList.length
        ? Math.round(total / studentList.length)
        : 0;
      return { platform, value: avg };
    });
  };

  return (
    <div className="min-h-screen p-8 scrollbar-hide bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      <div className="flex w-full flex-row item-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-4 appearance-none py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            <option value="class">Class Stats</option>
            <option value="department">Department Stats</option>
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            <option value="all">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="hackerrank">HackerRank</option>
            <option value="codechef">CodeChef</option>
            <option value="codeforces">Codeforces</option>
            <option value="skillrack">Skillrack</option>
            <option value="github">GitHub</option>
          </select>
        </div>
        {showCharts && (
          <button
            onClick={onShowTopPerformer}
            className="px-4 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-all text-sm font-medium"
          >
            Overall Top Performers
          </button>
        )}
        {!showCharts && (
          <button
            onClick={() => {
              setTopPerformers([]);
              setShowCharts(true);
            }}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all text-sm font-medium"
          >
            Show Charts
          </button>
        )}
      </div>

      {showCharts && (
        <>
          {selectedChart === "class" ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
                Class Performance Chart
              </h2>
              <div style={{ height: "33rem" }}>
                <Bar
                  data={classChartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          afterBody: (context) => {
                            const label = context[0].label;
                            const breakdown =
                              selectedChart === "class"
                                ? getPlatformBreakdownForClass(
                                    classes.find(
                                      (cls) =>
                                        (cls.username || cls.name) === label
                                    )
                                  )
                                : getPlatformBreakdownForDepartment(
                                    departments.find((d) => d.name === label)
                                      ?._id
                                  );
                            return breakdown.map(
                              (line) => `${line.platform}: ${line.value}`
                            );
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
                Department Performance Chart
              </h2>
              <div style={{ height: "33rem" }}>
                <Bar
                  data={departmentChartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          afterBody: (context) => {
                            const label = context[0].label;
                            const breakdown =
                              selectedChart === "class"
                                ? getPlatformBreakdownForClass(
                                    classes.find(
                                      (cls) =>
                                        (cls.username || cls.name) === label
                                    )
                                  )
                                : getPlatformBreakdownForDepartment(
                                    departments.find((d) => d.name === label)
                                      ?._id
                                  );
                            return breakdown.map(
                              (line) => `${line.platform}: ${line.value}`
                            );
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
      {topPerformers.length > 0 && (
        <div className="mt-10 bg-white dark:bg-gray-900 shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Top Performers
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topPerformers.map((student, index) => {
                  const rankBadges = ["🥇", "🥈", "🥉"];
                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 text-center dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100 font-semibold">
                        {rankBadges[index] ?? index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {student.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex align-center justify-center text-center text-sm font-medium">
                        <button
                          onClick={() =>
                            setSelectedStudent(
                              selectedStudent?._id === student._id
                                ? null
                                : student
                            )
                          }
                          className="text-blue-600 flex shrink-0 cursor-pointer dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                        >
                          {selectedStudent?._id === student?._id
                            ? "Hide"
                            : "View More"}
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {
        selectedStudent && <StudentCard onClose={()=>{
            setSelectedStudent(null)
        }} student={selectedStudent} />
      }
    </div>
  );
}
