import React from "react";
import logo from "/algolog.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747407322934.json";

export default function Auth({ handleLogin }) {
  const [rollNo, setRollNo] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submitLogin = async (e) => {
    e.preventDefault();
    handleLogin(rollNo, password);
  };

  return (
    <div className="min-h-screen h-screen bg-[#141B2A] flex flex-col p-6 relative overflow-hidden">
      <div className="flex w-full items-center">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-14 h-14 object-contain"
        />
        <h1 className="ml-3 text-2xl font-bold text-purple-400">AlgoLog</h1>
      </div>
      <div className="flex">
        <div className="w-full sm:h-full h-[35rem] sm:w-1/2 flex items-center justify-center ">
          <div className="sm:mt-10 sm:w-[26rem] w-fit p-6 rounded-2xl border border-[#7E8391] backdrop-blur-md shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-white text-center">
              Hey Coder! 👋
            </h2>
            <p className="text-sm text-gray-400 text-center mb-6">
              Let’s help you track your coding journey and shine through your
              progress.
            </p>
            <form onSubmit={submitLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter your roll number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="px-4 py-3 rounded-md bg-[#1F2937] text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 rounded-md bg-[#1F2937] text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
              >
                Login
              </button>
            </form>
          </div>
        </div>
        <div className="w-1/2 hidden sm:flex items-center justify-center">
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
