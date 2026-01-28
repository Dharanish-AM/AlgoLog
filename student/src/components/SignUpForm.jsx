import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { X } from "lucide-react";
import { validateSkillrackUrl } from "../utils/skillrackValidator";
import { STUDENT_YEARS, ACCOMMODATION_TYPES, GENDERS, INTERESTS, SECTIONS, DEPARTMENTS } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL;

const SignUpForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    rollNo: "",
    year: "",
    section: "",
    department: "",
    accommodation: "",
    gender: "",
    interest: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Departments are now loaded from constants, no need to fetch from API
    setLoading(false);
  }, []);

  const selectedDept = null; // No longer needed since we use DEPARTMENTS constant

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
        leetcode: formData.leetcode.trim(),
        hackerrank: formData.hackerrank.trim(),
        codechef: formData.codechef.trim(),
        codeforces: formData.codeforces.trim(),
        skillrack: skillrackUrl,
        github: formData.github.trim(),
      };
      const success = await onSubmit(trimmedData);
      console.log("SignUpForm received success:", success);
      if (success) {
        console.log("SignUpForm: Clearing form data on success");
        // Only clear form data on successful signup
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          rollNo: "",
          year: "",
          section: "",
          department: "",
          accommodation: "",
          gender: "",
          interest: "",
          leetcode: "",
          hackerrank: "",
          codechef: "",
          codeforces: "",
          skillrack: "",
          github: "",
        });
        // Do not close here; parent (Auth) toggles view to Login.
      } else {
        console.log("SignUpForm: Preserving form data, success was false");
      }
      // If success is false, keep form data and modal open so user can fix errors
    } catch (err) {
      // Keep form data and modal open on error
      console.error("SignUpForm error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161F2D] absolute inset-0 z-50 w-screen flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

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
          {[
            { label: "Name", key: "name", type: "text", required: true },
            { label: "Email", key: "email", type: "email", required: true },
            { label: "Mobile Number", key: "mobileNumber", type: "tel", required: true },
            { label: "Roll Number", key: "rollNo", required: true },
            {
              label: "Department & Section",
              key: "section",
              type: "dropdown",
              required: true,
            },
            {
              label: "Gender",
              key: "gender",
              type: "dropdown",
              required: true,
              options: GENDERS,
            },
            {
              label: "Accommodation",
              key: "accommodation",
              type: "dropdown",
              required: true,
              options: ACCOMMODATION_TYPES,
            },
            {
              label: "Interest",
              key: "interest",
              type: "dropdown",
              required: true,
              options: INTERESTS,
            },
            {
              label: "LeetCode Profile ID",
              key: "leetcode",
              type: "text",
              required: true,
            },
            {
              label: "HackerRank Profile ID",
              key: "hackerrank",
              type: "text",
              required: true,
            },
            {
              label: "CodeChef Profile ID",
              key: "codechef",
              type: "text",
              required: true,
            },
            {
              label: "Codeforces Profile ID",
              key: "codeforces",
              type: "text",
              required: true,
            },
            {
              label: "SkillRack Profile URL",
              key: "skillrack",
              type: "text",
              required: true,
            },
            {
              label: "GitHub Profile Username",
              key: "github",
              type: "text",
              required: false,
            },
          ].map(({ label, key, type = "text", required, options }) => (
            <React.Fragment key={key}>
              {key === "section" ? (
                <>
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
                      <option value="" disabled>
                        Select department
                      </option>
                      {DEPARTMENTS.map((dpt) => (
                        <option key={dpt} value={dpt}>
                          {dpt}
                        </option>
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
                      <option value="" disabled>
                        Select section
                      </option>
                      {SECTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : type === "dropdown" && (key === "gender" || key === "interest" || key === "accommodation") ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <select
                    value={formData[key] || ""}
                    required={required}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="" disabled>
                      Select {label.toLowerCase()}
                    </option>
                    {options &&
                      options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
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
                                ? "Enter skillrack URL (e.g., https://www.skillrack.com/profile/484170/384bf14cad47...)"
                                : key === "github"
                                  ? "Enter GitHub username (e.g., johndoe)"
                                  : `Enter ${label.toLowerCase()}`
                    }
                    onChange={(e) => {
                      let value = e.target.value;
                      if (
                        key === "leetcode" ||
                        key === "hackerrank" ||
                        key === "codechef" ||
                        key === "codeforces" ||
                        key === "skillrack" ||
                        key === "github"
                      ) {
                        value = value.trimStart();
                        if (
                          key === "skillrack" &&
                          value.startsWith("http://")
                        ) {
                          value = "https://" + value.slice(7); // Enforce https for skillrack
                        }
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
                          // URL parsing failed, use value as-is
                        }
                      }
                      setFormData({
                        ...formData,
                        [key]: key === "rollNo" ? value.toUpperCase() : value,
                      });
                    }}
                    className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
              {key === "section" && (
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
                    <option value="" disabled>
                      Select year
                    </option>
                    {STUDENT_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
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
