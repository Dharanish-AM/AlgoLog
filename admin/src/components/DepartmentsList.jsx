import React from "react";
import cseIcon from "../assets/dept/cse.png";
import eceIcon from "../assets/dept/ece.png";
import mechIcon from "../assets/dept/mech.png";
import csbsIcon from "../assets/dept/csbs.png";
import eeeIcons from "../assets/dept/eee.png";
import itIcon from "../assets/dept/it.png";
import aimlIcon from "../assets/dept/aiml.png";
import aidsIcon from "../assets/dept/aids.png";
import cceIcon from "../assets/dept/cce.png";


const deptIcons = {
  cse: cseIcon,
  ece: eceIcon,
  mech: mechIcon,
  csbs: csbsIcon,
  eee: eeeIcons,
  it: itIcon,
  aiml: aimlIcon,
  aids: aidsIcon,
  cce: cceIcon,
};

export default function DepartmentsList({ departments, handleDepartmentClick }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        All Departments
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {departments && departments.map((dept) => (
          <div
            key={dept._id}
            onClick={() => handleDepartmentClick(dept._id, dept.name)}
            className="bg-white cursor-pointer dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
          >

            <div className="text-4xl mb-3">
              <img
                src={deptIcons[dept.name.toLowerCase()]}
                alt={`${dept.name} Department Icon`}
                className="w-16 h-16"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">
              {dept.name}
            </h3>
          </div>
        ))}
      </div>
    </>
  );
}