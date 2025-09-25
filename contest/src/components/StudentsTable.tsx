import React from 'react';
import { Student } from '../types';
import { Trophy, TrendingUp } from 'lucide-react';

interface StudentsTableProps {
  students: Student[];
}

const StudentsTable: React.FC<StudentsTableProps> = ({ students }) => {
  if (students.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 sm:p-12 text-center">
        <div className="text-slate-400 mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg">No students found</p>
          <p className="text-sm">Try adjusting your filters to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">S.No</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Roll No</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Name</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Problems</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Rating</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Global Rank</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Contests</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Top %</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {students.map((student, index) => (
              <tr 
                key={student.id} 
                className="hover:bg-slate-700/50 transition-colors duration-200"
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-300">
                  {index + 1}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-slate-200">
                  {student.rollNo}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div>
                    <div className="text-sm font-medium text-white truncate max-w-32 sm:max-w-none">{student.name}</div>
                    <div className="text-xs sm:text-sm text-slate-400 hidden sm:block">{student.department} • Class {student.class} • {student.year}</div>
                    <div className="text-xs text-slate-400 sm:hidden">{student.class} • {student.year}</div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-white font-semibold mb-1">{student.problemsSolved.total}</div>
                  <div className="flex justify-center gap-1 text-xs flex-wrap">
                    <span className="bg-green-500/20 text-green-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">E: {student.problemsSolved.easy}</span>
                    <span className="bg-yellow-500/20 text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">M: {student.problemsSolved.medium}</span>
                    <span className="bg-red-500/20 text-red-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">H: {student.problemsSolved.hard}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span className={`text-sm font-semibold ${
                    student.rating >= 2000 ? 'text-purple-400' :
                    student.rating >= 1600 ? 'text-blue-400' :
                    student.rating >= 1200 ? 'text-green-400' : 'text-slate-300'
                  }`}>
                    {student.rating}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-sm text-slate-300 hidden lg:table-cell">
                  {student.globalRank.toLocaleString()}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-sm text-slate-300 hidden md:table-cell">
                  {student.contestCount}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-sm font-medium ${
                      student.topPercent <= 10 ? 'text-green-400' :
                      student.topPercent <= 20 ? 'text-yellow-400' : 'text-slate-300'
                    }`}>
                      {student.topPercent}%
                    </span>
                    {student.topPercent <= 10 && (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;