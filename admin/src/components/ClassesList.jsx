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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className="bg-white mt-2 flex-col gap-2 dark:bg-gray-800 relative p-6 rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200 dark:border-gray-700 cursor-pointer flex items-start justify-center text-center"
            >
              <Edit
                size={20}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Username:
                </span>{" "}
                <span className="text-gray-900 dark:text-white">
                  {cls.username}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Email:
                </span>{" "}
                <span className="text-gray-900 dark:text-white">
                  {cls.email}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Section:
                </span>{" "}
                <span className="text-gray-900 dark:text-white">
                  {cls.section}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Total Students:
                </span>{" "}
                <span className="text-gray-900 dark:text-white">
                  {cls.students.length}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
