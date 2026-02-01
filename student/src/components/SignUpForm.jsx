import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GridLoader } from "react-spinners";
import { X } from "lucide-react";
import { validateSkillrackUrl } from "../utils/skillrackValidator";
import { YEARS, ACCOMMODATION_TYPES, GENDERS, INTERESTS, DEPARTMENTS, SECTIONS } from "../utils/constants";

const SignUpForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    rollNo: "",
    gender: "",
    accommodation: "",
    department: "",
    year: "",
    section: "",
    interest: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.email.endsWith("@sece.ac.in")) {
      toast.error("Email must end with @sece.ac.in");
      setIsSubmitting(false);
      return;
    }

    // Validate Skillrack URL
    const skillrackUrl = formData.skillrack.trim();
    const skillrackValidation = validateSkillrackUrl(skillrackUrl);
    if (!skillrackValidation.valid) {
      toast.error(skillrackValidation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      const trimmedData = {
        ...formData,
        mobileNumber: formData.mobileNumber.trim(),
        leetcode: formData.leetcode.trim(),
        hackerrank: formData.hackerrank.trim(),
        codechef: formData.codechef.trim(),
        codeforces: formData.codeforces.trim(),
        skillrack: skillrackUrl,
        github: formData.github.trim(),
      };

      // Pass to parent
      const success = await onSubmit(trimmedData);

      if (success) {
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          rollNo: "",
          gender: "",
          accommodation: "",
          department: "",
          year: "",
          section: "",
          interest: "",
          leetcode: "",
          hackerrank: "",
          codechef: "",
          codeforces: "",
          skillrack: "",
          github: "",
        });
        // Do not close here; parent (Auth) toggles view to Login.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/40 absolute inset-0 z-50 bg-opacity-50 flex flex-col items-center py-8 justify-center min-h-screen w-full">
      <div className="relative bg-white dark:bg-gray-800 overflow-auto scrollbar-hide rounded-lg p-6 h-[90vh] sm:w-[55vw] w-[85vw]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enter Student Details
          </h2>
          <X onClick={onClose} className="text-gray-400 cursor-pointer" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Personal Information</h3>
          {/* Personal Info */}
          {[
            { label: "Name", key: "name", type: "text", required: true },
            { label: "Email", key: "email", type: "email", required: true },
            { label: "Mobile Number", key: "mobileNumber", type: "tel", required: true },
            { label: "Roll Number", key: "rollNo", required: true },
          ].map(({ label, key, type = "text", required }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={formData[key]}
                required={required}
                placeholder={`Enter ${label.toLowerCase()}`}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [key]: key === "rollNo" ? e.target.value.toUpperCase() : e.target.value,
                  })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                required
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Accommodation
              </label>
              <select
                value={formData.accommodation}
                required
                onChange={(e) =>
                  setFormData({ ...formData, accommodation: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Accommodation</option>
                {ACCOMMODATION_TYPES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 pt-4">Academic Information</h3>
          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                required
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.sort().map((dpt) => (
                  <option key={dpt} value={dpt}>
                    {dpt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                value={formData.year}
                required
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section
              </label>
              <select
                value={formData.section}
                required
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Section</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Area of Interest
              </label>
              <select
                value={formData.interest}
                required
                onChange={(e) =>
                  setFormData({ ...formData, interest: e.target.value })
                }
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>Select Interest</option>
                {INTERESTS.map((int) => (
                  <option key={int} value={int}>{int}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 pt-4">Platform Handles</h3>
          {/* Platform Handles */}
          {[
            { label: "LeetCode Profile ID", key: "leetcode", required: true },
            { label: "HackerRank Profile ID", key: "hackerrank", required: true },
            { label: "CodeChef Profile ID", key: "codechef", required: true },
            { label: "Codeforces Profile ID", key: "codeforces", required: true },
            { label: "SkillRack Profile URL", key: "skillrack", required: true },
            { label: "GitHub Profile Username", key: "github", required: true },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={formData[key]}
                required={required}
                placeholder={
                  key === "leetcode"
                    ? "Enter leetcode username (e.g., johndoe123)"
                    : key === "hackerrank"
                      ? "Enter hackerrank username (e.g., johndoe_hr)"
                      : key === "codechef"
                        ? "Enter codechef username (e.g., johndoe_cc)"
                        : key === "codeforces"
                          ? "Enter codeforces username (e.g., johndoe_cf)"
                          : key === "skillrack"
                            ? "Enter skillrack URL (e.g., https://www.skillrack.com/profile/484170/...)"
                            : key === "github"
                              ? "Enter GitHub username (e.g., johndoe)"
                              : `Enter ${label.toLowerCase()}`
                }
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.trimStart();
                  if (key === "skillrack" && value.startsWith("http://")) {
                    value = "https://" + value.slice(7);
                  }
                  // Clean logic for platform handles
                  try {
                    if (value.startsWith("http")) {
                      const url = new URL(value);
                      if (key === "leetcode" && url.pathname.startsWith("/u/")) {
                        value = url.pathname.split("/u/")[1].replace(/\/$/, "");
                      } else if (key === "hackerrank" && url.pathname.startsWith("/profile/")) {
                        value = url.pathname.split("/profile/")[1].replace(/\/$/, "");
                      } else if (key === "codechef" && url.pathname.startsWith("/users/")) {
                        value = url.pathname.split("/users/")[1].replace(/\/$/, "");
                      } else if (key === "codeforces" && url.pathname.startsWith("/profile/")) {
                        value = url.pathname.split("/profile/")[1].replace(/\/$/, "");
                      } else if (key === "github") {
                        value = url.pathname.split("/")[1].replace(/\/$/, "") || value;
                      }
                    }
                  } catch (e) {
                    // Ignore
                  }
                  setFormData({ ...formData, [key]: value });
                }}
                className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm font-semibold w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {isSubmitting && (
          <div className="absolute inset-0 bg-purple-900/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <GridLoader color="#C084FC" size={18} />
          </div>
        )}
      </div>
      <footer className="fixed bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-xl shadow-md backdrop-blur-sm">
        Made by{" "}
        <a
          href="https://github.com/Dharanish-AM"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-purple-400 hover:underline"
        >
          @dharanisham
        </a>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SignUpForm;
