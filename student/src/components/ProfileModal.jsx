import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { GridLoader } from "react-spinners";

const departments = [
  { _id: "cse", name: "CSE" },
  { _id: "ece", name: "ECE" },
  { _id: "eee", name: "EEE" },
  { _id: "it", name: "IT" },
];

export default function ProfileModal({ student, onClose }) {
  const [data, setData] = useState(student);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving student data:", data);
    onClose();
  };

  if (!student) {
    return (
      <div className="bg-[#161F2D] flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <div className="fixed bg-black/50 inset-0 flex items-center justify-center z-50">
      <div className="bg-white scrollbar-hide dark:bg-gray-800 p-6 rounded-lg shadow-lg sm:w-full max-w-xl sm:max-h-[90h] h-[90%] w-[90%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Student
          </h2>
          <X
            onClick={() => onClose()}
            className="text-gray-400 cursor-pointer"
          />
        </div>
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
                value={data[field]}
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
              value={data.department}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2.5 px-3 text-sm"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year
            </label>
            <select
              name="year"
              value={data.year}
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
            <select
              name="section"
              value={data.section}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2.5 px-3 text-sm"
            >
              <option value="" disabled>
                Select section
              </option>
              {["A", "B", "C", "D"].map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="submit"
              className="px-4 sm:py-3 py-1 text-sm cursor-pointer w-full bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Change Password
            </button>
            <button
              type="submit"
              className="px-4 py-3 text-sm cursor-pointer w-full bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
