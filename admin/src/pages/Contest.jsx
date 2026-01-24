import React, { useEffect, useState } from "react";
import { Users, Trophy, Code, BarChart3, Loader2, RefreshCw, TrendingUp, GitCompare } from "lucide-react";
import { GridLoader } from "react-spinners";
import StudentsView from "../components/contest/StudentsView";
import ContestsView from "../components/contest/ContestsView";
import AnalyticsView from "../components/contest/AnalyticsView";
import ComparisonView from "../components/contest/ComparisonView";
import { useDispatch, useSelector } from "react-redux";
import { getAllContests, getAllStudents } from "../services/adminOperations";
import logo from "../assets/algolog.png";

function Contest() {
  const [activeView, setActiveView] = useState("students");
  const [isLoading, setIsLoading] = useState(false);
  const allStudents = useSelector((state) => state.admin.allStudents);
  const allContests = useSelector((state) => state.admin.allContests);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getAllStudents(token, dispatch);

        await getAllContests(token, dispatch);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (allStudents.length === 0 || allContests.length === 0) {
      fetchData();
    }
  }, [allContests.length, allStudents.length, dispatch, token]);

  // Full-page loader (same style as App loader)
  if (isLoading || (allStudents.length === 0 && allContests.length === 0)) {
    return (
      <div className="bg-gradient-to-br from-[#161F2D] via-[#1a2332] to-[#161F2D] flex flex-col justify-center items-center w-screen h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  const navigationItems = [
    {
      id: "students",
      label: "Students",
      icon: Users,
      description: "View student performance",
    },
    {
      id: "contests",
      label: "Contests",
      icon: Trophy,
      description: "Monitor contest results",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      description: "Advanced insights & trends",
    },
    {
      id: "comparison",
      label: "Compare",
      icon: GitCompare,
      description: "Compare students",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 group">
              <img src={logo} alt="AlgoLog Logo" className="w-11 h-11 transition-transform group-hover:scale-110" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  LeetCode Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Coding Contest Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300 hidden sm:inline font-medium">
                Analytics Panel
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeView === item.id
                    ? "text-blue-400 border-blue-400 bg-blue-400/5"
                    : "text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-300 hover:bg-slate-700/30"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center text-slate-200 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm sm:text-base">Loading contests and students...</span>
          </div>
        ) : (
          <>
            {activeView === "students" && <StudentsView />}
            {activeView === "contests" && <ContestsView />}
            {activeView === "analytics" && <AnalyticsView />}
            {activeView === "comparison" && <ComparisonView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-slate-400 text-sm">
            <p className="text-xs sm:text-sm">
              © 2025 AlgoLog. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contest;
