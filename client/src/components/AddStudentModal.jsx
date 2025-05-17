import React, { useEffect, useState } from "react";
import { Axis3DIcon, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getDepartments } from "../services/studentOperations";

const AddStudentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    year: "",
    classId: "",
    section: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "",
  });
    const [departments, setDepartments] = useState([]);
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

  useEffect(() => {
    const fetchDepartments = async () => {
      const dpt = await getDepartments(token, dispatch);
      setDepartments(dpt);
    };
    fetchDepartments();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedData = {
      ...formData,
      leetcode: formData.leetcode.trim(),
      hackerrank: formData.hackerrank.trim(),
      codechef: formData.codechef.trim(),
      codeforces: formData.codeforces.trim(),
      skillrack: formData.skillrack.trim(),
      github: formData.github.trim(),
    };
    onClose();
    onSubmit(trimmedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="scrollbar-hide bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Student
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Name", key: "name", type: "text", required: true },
            { label: "Email", key: "email", type: "email", required: true },
            { label: "Roll Number", key: "rollNo", required: true },
            { label: "Section", key: "section", required: true },
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
          ].map(({ label, key, type = "text", required }, index) => (
            <React.Fragment key={key}>
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
                      if (key === "skillrack" && value.startsWith("http://")) {
                        value = "https://" + value.slice(7); // Enforce https for skillrack
                      }
                    }
                    setFormData({ ...formData, [key]: value });
                  }}
                  className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
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
              {key === "section" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.classId}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                    className="text-sm w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="" disabled>
                      Select department
                    </option>
                    {departments.map((dpt) => (
                      <option key={dpt._id} value={dpt._id}>
                        {dpt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
