import React, { useEffect } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import { useDispatch } from "react-redux";

export default function ClassesList({
  departmentId,
  departmentName,
  classes,
  setSelectedClass,
  setSelectedDepartment,
  setSelectedDepartmentName,
}) {
  const [selectedBatch, setSelectedBatch] = React.useState("all");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: "SET_CURRENT_YEAR",
      payload: selectedBatch,
    });
  }, [selectedBatch]);

  const filteredClasses = classes
    .filter((cls) => cls.department === departmentId)
    .filter(
      (cls) => selectedBatch === "all" || cls.year?.toString() === selectedBatch
    );

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <ArrowLeft
          onClick={() => {
            setSelectedDepartment("");
            setSelectedDepartmentName("");
            setSelectedClass("");
          }}
          className="inline-block cursor-pointer mr-2 text-gray-500 dark:text-gray-400"
          size={26}
        />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {departmentName} - Department Classes
        </p>
      </div>
      <div className="mb-4">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-4 py-2 appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Years</option>
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
      {filteredClasses.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No classes found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <div
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className="group bg-white dark:bg-gray-800 relative p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden"
            >
              {/* Edit icon */}
              <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                <Edit size={16} className="text-gray-600 dark:text-gray-400" />
              </div>

              {/* Content */}
              <div className="relative space-y-3">
                {/* Username as title with section badge */}
                <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                    {cls.username}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    Section {cls.section}
                  </span>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Academic Year
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {cls.year || 'N/A'}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Email Address
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {cls.email}
                  </p>
                </div>

                {/* Student count with badge */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Total Students
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {cls.students.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
