import React from "react";

function BugReportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-95 border border-purple-400/30 backdrop-blur-sm"
      title="Report a bug"
    >
      🐛
    </button>
  );
}

export default BugReportButton;
