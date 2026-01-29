import React from "react";
import { Bug } from "lucide-react";

function BugReportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 bg-dark-100 hover:bg-dark-200 text-purple-400 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border border-purple-500/30 transition-all duration-300 flex items-center justify-center z-40 transform hover:scale-110 active:scale-95 group"
      title="Report a bug"
    >
      <Bug className="w-6 h-6 group-hover:rotate-12 transition-transform" />
    </button>
  );
}

export default BugReportButton;
