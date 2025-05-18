import React, { useEffect } from "react";
import logo from "../assets/algolog.png";
import { UserPlus, Download, User, ChartBar, School, Plus } from "lucide-react";
import Profile from "./Profile";
import AddDepartment from "./AddDepartment";
import AddClass from "./AddClass";

export default function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] =
    React.useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-10 h-10 aspect-square"
        />
        <h1 className="ml-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
          AlgoLog
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={()=>setIsAddDepartmentModalOpen(true)} className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
          <Plus
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Add Department
          </span>
        </button>
         <button onClick={()=>setIsAddClassModalOpen(true)} className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
          <Plus
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Add Class
          </span>
        </button>
        <button className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
          <ChartBar
            className="w-5 h-5 text-gray-800 dark:text-gray-100"
            size={18}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            View Analytics
          </span>
        </button>
        <button className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700">
          <Download className="dark:text-gray-100 text-gray-800" size={18} />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Export CSV
          </span>
        </button>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex border ml-3 border-gray-500 items-center gap-2 p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <User size={"1.5rem"} className="text-gray-400 dark:text-gray-300" />
        </button>
      </div>
      {isProfileModalOpen && (
        <Profile onClose={() => setIsProfileModalOpen(false)} />
      )}
      {
        isAddDepartmentModalOpen && (
          <AddDepartment
            onClose={() => setIsAddDepartmentModalOpen(false)}
          />
        )
      }
      {
        isAddClassModalOpen && (
          <AddClass
            onClose={() => setIsAddClassModalOpen(false)}
          />
        )
      }
    </div>
  );
}
