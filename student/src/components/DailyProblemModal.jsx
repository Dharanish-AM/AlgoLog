import React from 'react';
import { X, ExternalLink, Calendar, Code } from 'lucide-react';

export default function DailyProblemModal({ isOpen, onClose, problem }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-dark-100 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-dark-200/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <span className="text-yellow-400">💡</span> Daily LeetCode Problem
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Challenge yourself with today's pick</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {problem ? (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{problem.question?.title || "Problem Title"}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${problem.question?.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                problem.question?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {problem.question?.difficulty || 'Unknown'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={`https://leetcode.com${problem.link || '/problemset/all/'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#ffa116] hover:bg-[#ffa116]/90 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-500/20 whitespace-nowrap"
                                >
                                    Solve Now <ExternalLink size={16} />
                                </a>
                            </div>

                            {/* Tags/Categories if available (Mocked or from API if detailed) */}
                            <div className="p-4 bg-dark-200/50 rounded-xl border border-gray-700/50">
                                <div className="flex items-center gap-3 text-gray-300 mb-2">
                                    <Code size={18} className="text-purple-400" />
                                    <span className="font-semibold text-sm">Problem Link</span>
                                </div>
                                <a href={`https://leetcode.com${problem.link}`} target="_blank" className="text-blue-400 hover:text-blue-300 text-sm break-all hover:underline block truncate">
                                    https://leetcode.com{problem.link}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl">🤔</div>
                            <h3 className="text-lg font-bold text-white">No Problem Found</h3>
                            <p className="text-gray-400 max-w-xs mx-auto mt-2">Could not fetch the daily problem at this time. Please try again later.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-dark-200/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
