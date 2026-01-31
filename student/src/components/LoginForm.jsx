import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

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
    <div className="w-full max-w-md p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">
          Welcome Back! 👋
        </h2>
        <p className="text-gray-400">
          Continue your coding journey with AlgoLog
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Roll Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="e.g. 21IT001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              autoComplete="username"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-100/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-100/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Login to Dashboard
        </button>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-400">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className="text-primary-400 font-semibold hover:text-primary-300 hover:underline transition-colors focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
