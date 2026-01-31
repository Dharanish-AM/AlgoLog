import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { X, Send, Mail, Hash, AlertCircle, FileText } from "lucide-react";

function BugReportModal({ isOpen, onClose, studentId, isAuthenticated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !email.trim() || !rollNo.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bug-reports`,
        {
          studentId: studentId || "",
          email,
          rollNo,
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Bug report submitted successfully!");
        setTitle("");
        setDescription("");
        setEmail("");
        setRollNo("");
        onClose();
      }
    } catch (err) {
      console.error("Error submitting bug report:", err);
      toast.error("Failed to submit bug report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const InputIcon = ({ icon: Icon }) => (
    <div className="absolute top-3 left-3 pointer-events-none">
      <Icon size={16} className="text-gray-500 group-focus-within:text-primary-400 transition-colors" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg glass-card rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🐛</span> Report a Bug
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-5 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Email</label>
              <div className="relative group">
                <InputIcon icon={Mail} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Roll Number</label>
              <div className="relative group">
                <InputIcon icon={Hash} />
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Roll No"
                  className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Issue Title</label>
            <div className="relative group">
              <InputIcon icon={AlertCircle} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of the bug"
                className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Description</label>
            <div className="relative group">
              <InputIcon icon={FileText} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, expected behavior, and steps to reproduce..."
                rows="4"
                className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg transform active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BugReportModal;
