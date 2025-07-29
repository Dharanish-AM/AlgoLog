import React from "react";
import logo from "../assets/algolog.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747373498451.json";
import { useDispatch } from "react-redux";
import { handleLogin } from "../services/authOperations";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const dispatch = useDispatch();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    const response = await handleLogin(email, password, dispatch);
    console.log(response);
    if (response.status === 200) {
      toast.success("Login Success!");
      localStorage.setItem("token", response.data.token);
      window.location.reload();
    } else {
      toast.error(response.message);
    }
  };


  return (
    <div className="min-h-screen bg-[#141B2A] flex flex-col px-4 py-8 relative">
      <div className="absolute top-4 left-4 flex items-center">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-14 h-14 object-contain"
        />
        <h1 className="ml-3 text-2xl font-bold text-purple-400">AlgoLog</h1>
      </div>
      <div className="flex flex-1">
        <div className="w-1/2 flex items-center justify-center">
          <div className="mt-10 w-[25rem] p-6 rounded-2xl border border-[#7E8391] backdrop-blur-md shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">
              Welcome Back ! Admin
              <p className="font-medium mt-2 text-gray-400 text-sm">
                Track, assess, and guide student coders.
              </p>
            </h2>
            <form onSubmit={submitLogin} className="flex flex-col gap-4 mt-4">
              <input
                type="email"
                placeholder="Enter you email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
              >
                Login
              </button>
            </form>
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <Lottie
            animationData={Animation}
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>
      <footer className="fixed bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-xl shadow-md backdrop-blur-sm">
        Made by{" "}
        <a
          href="https://github.com/Dharanish-AM"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-purple-400 hover:underline"
        >
          @dharanisham
        </a>
      </footer>
    </div>
  );
}
