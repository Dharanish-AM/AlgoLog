import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginClass } from "../services/authOperations";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function TutorLogin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginClass(formData, dispatch);
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
            htmlFor="username"
            className="block text-sm font-medium text-gray-400"
          >
            Username
          </label>
          <input
            placeholder="Enter your username"
            type="text"
            id="username"
            name="username"
            className="mt-1.5 text-white block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.username}
            onChange={handleChange}
          />
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
              className="mt-1.5 text-white block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          <p className="block mt-4 cursor-pointer text-sm text-gray-400">
            Forgot Password ?
          </p>
        </div>
        <button
          type="submit"
          className="w-full mt-8 py-2 px-4 bg-purple-600 text-white transition-colors duration-300 ease-in-out font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Login
        </button>
      </form>
    </div>
  );
}
