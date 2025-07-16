import React, { useState } from "react";
import { addDepartment } from "../services/adminOperations";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddDepartment({ onClose }) {
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await addDepartment(token, name, dispatch);
    if (response.status === 201) {
      toast.success("Department added successfully");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <div className="flex-row flex item-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add Department
          </h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
            onClick={onClose}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter department name"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 w-full mt-4 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
