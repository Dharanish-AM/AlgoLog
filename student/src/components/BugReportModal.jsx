import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

function BugReportModal({ isOpen, onClose, studentId, isAuthenticated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];

    if (newImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages(newImages);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

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
      toast.error(
        "Failed to submit bug report: " +
        (err.response?.data?.error || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-auto md:bottom-24 md:left-6 md:translate-x-0 md:translate-y-0 w-[90%] md:w-full md:max-w-md max-h-[90vh] md:max-h-[80vh] bg-gradient-to-b from-[#1f2937] to-[#111827] border border-purple-500/40 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent">
          <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span className="text-lg md:text-xl">🐛</span> Report a Bug
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          {/* Form Fields */}
          <div className="p-3 md:p-4 space-y-3 md:space-y-4 flex-1 overflow-y-auto">
            {/* Email Input */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-200 mb-1.5 md:mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-[#1f2937] border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition"
              />
            </div>

            {/* Roll Number Input */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-200 mb-1.5 md:mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Your roll number"
                className="w-full bg-[#1f2937] border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-200 mb-1.5 md:mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of the bug"
                className="w-full bg-[#1f2937] border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-200 mb-1.5 md:mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the bug..."
                rows="3"
                className="w-full bg-[#1f2937] border border-purple-500/30 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 md:gap-3 p-3 md:p-5 border-t border-purple-500/20 bg-gradient-to-r from-gray-900/30 to-transparent">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span> Submitting...
                </>
              ) : (
                "✓ Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BugReportModal;
