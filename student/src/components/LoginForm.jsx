import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginForm({
  submitLogin,
  rollNo,
  setRollNo,
  password,
  setPassword,
  setIsSignup
}) {
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin();
  };
  return (
    <div className="sm:mt-10 sm:w-[26rem] w-fit p-6 rounded-2xl border border-[#7E8391] backdrop-blur-md shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">
        Hey Coder! 👋
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Let’s help you track your coding journey and shine through your
        progress.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your roll number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="px-4 py-3 rounded-md bg-[#1F2937] text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 w-full rounded-md bg-[#1F2937] text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>
        <button
          type="submit"
          className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
        >
          Login
        </button>
        <p className="text-sm text-gray-400 text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => setIsSignup(true)}
            className="text-purple-400 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
