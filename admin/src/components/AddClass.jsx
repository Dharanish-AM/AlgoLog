import { X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addClass } from "../services/adminOperations";

export default function AddClass({ onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    section: "",
    departmentId: "",
  });
  const token = localStorage.getItem("token");
  const dispatch = useDispatch()

  const departments = useSelector((state) => state.admin.departments);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await addClass(token,formData, dispatch);
    if (response.status === 201) {
      toast.success("Class added successfully");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <div className="flex-row flex item-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add Class
          </h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
            onClick={onClose}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="text-sm w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="text-sm w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
              className="text-sm w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
              className="text-sm w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 w-full cursor-pointer rounded-md hover:bg-blue-700 transition"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
