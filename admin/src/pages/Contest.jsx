import React, { useEffect, useState } from "react";
import { Users, Trophy, Code, BarChart3 } from "lucide-react";
import StudentsView from "../components/contest/StudentsView";
import ContestsView from "../components/contest/ContestsView";
import { useDispatch, useSelector } from "react-redux";
import { getAllContests, getAllStudents } from "../services/adminOperations";

function Contest() {
  const [activeView, setActiveView] = useState("students");
  const allStudents = useSelector((state) => state.admin.allStudents);
  const allContests = useSelector((state) => state.admin.allContests);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllStudents(token, dispatch);

        await getAllContests(token, dispatch);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (allStudents.length === 0 || allContests.length === 0) {
      fetchData();
    }
  }, [allContests.length, allStudents.length, dispatch, token]);

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
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img src="../algolog.png" alt="Logo" className="w-11 h-11" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  LeetCode Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Coding Contest Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-400 hidden sm:inline">
                Analytics Panel
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  activeView === item.id
                    ? "text-blue-400 border-blue-400"
                    : "text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-300"
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
        {activeView === "students" && <StudentsView />}
        {activeView === "contests" && <ContestsView />}
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
