import React, { useState, useEffect } from "react";

export default function EditStudentModal({ isOpen, onClose, onSave, student }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    department: "",
    year: "",
    section: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
    skillrack: "",
    github: "", // Added github field
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        rollNo: student.rollNo || "",
        department: student.department || "",
        year: student.year || "",
        section: student.section || "",
        leetcode: student?.leetcode || "",
        hackerrank: student?.hackerrank || "",
        codechef: student?.codechef || "",
        codeforces: student?.codeforces || "",
        skillrack: student?.skillrack || "",
        github: student?.github || "", // Set github value if it exists
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "leetcode" ||
      name === "hackerrank" ||
      name === "codechef" ||
      name === "codeforces" ||
      name === "skillrack" ||
      name === "github" // Handle github field change
    ) {
      setFormData({ ...formData, [name]: value.trim() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedData = {
      ...formData,
      leetcode: formData.leetcode.trim(),
      hackerrank: formData.hackerrank.trim(),
      codechef: formData.codechef.trim(),
      codeforces: formData.codeforces.trim(),
      skillrack: formData.skillrack.trim(),
      github: formData.github.trim(), // Trim github input before saving
    };
    onSave(trimmedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white scrollbar-hide dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Edit Student
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          "name",
          "email",
          "rollNo",
          "leetcode",
          "hackerrank",
          "codechef",
          "codeforces",
          "skillrack",
          "github",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {field}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              placeholder={
                field === "leetcode"
                  ? "Enter leetcode username (e.g., johndoe123)"
                  : field === "hackerrank"
                  ? "Enter hackerrank username (e.g., johndoe_hr)"
                  : field === "codechef"
                  ? "Enter codechef username (e.g., johndoe_cc)"
                  : field === "codeforces"
                  ? "Enter codeforces username (e.g., johndoe_cf)"
                  : field === "skillrack"
                  ? "Enter skillrack profile URL (e.g., https://www.skillrack.com/faces/resume.xhtml?id=484181...)"
                  : field === "github"
                  ? "Enter GitHub username (e.g., johndoe)"
                  : `Enter ${field}`
              }
              className="mt-1 py-2.5 px-3 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
            />
          </div> 
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2.5 px-3 text-sm"
          >
            <option value="" disabled>
              Select department
            </option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="AI&DS">AI&DS</option>
            <option value="AIML">AIML</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Year
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2.5 px-3 text-sm"
          >
            <option value="" disabled>
              Select year
            </option>
            <option value="2023-2027">2023-2027</option>
            <option value="2022-2026">2022-2026</option>
            <option value="2021-2025">2021-2025</option>
            <option value="2020-2024">2020-2024</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Section
          </label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2.5 px-3 text-sm"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
