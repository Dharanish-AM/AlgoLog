import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL);

const SignUpForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    year: "",
    section: "",
    department: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-form-details`);
        if (res.status == 200) {
          setDepartments(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const selectedDept = Array.isArray(departments)
    ? departments.find((d) => d._id === formData.department)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.email.endsWith("@sece.ac.in")) {
      toast.error("Email must end with @sece.ac.in");
      setIsSubmitting(false);
      return;
    }

    const skillrackUrl = formData.skillrack.trim();
    const skillrackRegex = /^https:\/\/www\.skillrack\.com\/faces\/resume\.xhtml\?id=\d+&key=[a-fA-F0-9]+$/;
    if (!skillrackRegex.test(skillrackUrl)) {
      toast.error("SkillRack URL must be in the format: https://www.skillrack.com/faces/resume.xhtml?id=<digits>&key=<hex>");
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
      console.log(trimmedData);
      const res = await axios.post(`${API_URL}/api/students`, trimmedData);
      if (res.status == 200 || res.status == 201) {
        toast.success("Student Added Successfully");
        setFormData({
          name: "",
          email: "",
          rollNo: "",
          year: "",
          department: "",
          leetcode: "",
          hackerrank: "",
          codechef: "",
          codeforces: "",
          skillrack: "",
          github: "",
        });
        onClose();
      } else {
        toast.error("Erro while adding student");
      }
    } catch (err) {
      toast.error("Error while adding student");
      console.error(err);
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
      <div className="bg-white dark:bg-gray-800 overflow-auto scrollbar-hide rounded-lg p-6 h-[90vh] sm:w-[55vw] w-[85vw]">
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
            { label: "Roll Number", key: "rollNo", required: true },
            {
              label: "Section",
              key: "section",
              type: "dropdown",
              required: true,
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
          ].map(({ label, key, type = "text", required }) => (
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
                      {departments &&
                        departments.map((dpt) => (
                          <option key={dpt._id} value={dpt._id}>
                            {dpt.name}
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
                      disabled={
                        !selectedDept || selectedDept.sections.length === 0
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="" disabled>
                        {selectedDept?.sections?.length
                          ? "Select section"
                          : "No sections available"}
                      </option>
                      {selectedDept?.sections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
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
                        ? "Enter skillrack profile URL (e.g., https://www.skillrack.com/faces/resume.xhtml?id=484181....)"
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
                          console.warn("Invalid URL format entered for", key, value);
                          console.error(e);
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
                      Select academic year
                    </option>
                    <option value="2027-2031">2027-2031</option>
                    <option value="2026-2030">2026-2030</option>
                    <option value="2025-2029">2025-2029</option>
                    <option value="2024-2028">2024-2028</option>
                    <option value="2023-2027">2023-2027</option>
                    <option value="2022-2026">2022-2026</option>
                    <option value="2021-2025">2021-2025</option>
                    <option value="2020-2024">2020-2024</option>
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
