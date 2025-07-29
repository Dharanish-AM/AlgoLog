import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { loginDepartment } from "../services/authOperations";
import { Eye, EyeOff } from "lucide-react";

export default function DepartmentLogin() {
  const [formData, setFormData] = useState({ departmentId: "", password: "" });
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/get-departments`);
        console.log(res)
        setDepartments(res.data?.departments || []);
      } catch (err) {
        toast.error("Failed to fetch departments");
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginDepartment(formData, dispatch); 
      if (response?.status === 200) {
        toast.success("Login Success!");
        window.location.reload();
      } else {
        toast.error(response?.data?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="departmentId"
            className="block text-sm font-medium text-gray-400"
          >
            Select Department
          </label>
          <select
            id="departmentId"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className="mt-1.5 block w-full text-white px-3 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-400"
          >
            Password
          </label>
          <div className="relative">
            <input
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1.5 text-white block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-2 px-4 bg-purple-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Login
        </button>
      </form>
    </div>
  );
}
