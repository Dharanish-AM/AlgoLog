import React from "react";
import { ArrowLeft, Edit } from "lucide-react";

export default function ClassesList({
  departmentId,
  departmentName,
  classes,
  setSelectedClass,
  setSelectedDepartment,
  setSelectedDepartmentName,
}) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {classes
          .filter((cls) => cls.department === departmentId)
          .map((cls) => (
            <div
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className="bg-white flex flex-col gap-2 dark:bg-gray-800 relative p-6 rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200 dark:border-gray-700 cursor-pointer flex flex-col items-start justify-center text-center"
            >
                <Edit size={20} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Username:</span>{" "}
                <span className="text-gray-900 dark:text-white">{cls.username}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{" "}
                <span className="text-gray-900 dark:text-white">{cls.email}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Section:</span>{" "}
                <span className="text-gray-900 dark:text-white">{cls.section}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Students:</span>{" "}
                <span className="text-gray-900 dark:text-white">{cls.students.length}</span>
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}