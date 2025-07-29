import React from "react";
import Header from "../components/Header";
import Illustration from "../assets/Coding workshop-bro.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747373498451.json";
import { useState } from "react";
import logo from "../../../faculty/algolog.png";
import TutorLogin from "../components/TutorLogin";
import Animation1 from "../assets/Animation - 1747407322934.json";
import DepartmentLogin from "../components/DepartmentLogin";
import { Headphones, HeadphonesIcon, LucideHeadphones } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isDepartmentLogin, setIsDepartmentLogin] = useState(false);
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
              Welcome Back!
              <p className="font-medium mt-2 text-gray-400 text-sm">
                Track, assess, and guide student coders.
              </p>
            </h2>
            {isDepartmentLogin ? (
              <DepartmentLogin
                switchTutor={() => {
                  setIsDepartmentLogin(false);
                }}
              />
            ) : (
              <TutorLogin
                switchDept={() => {
                  setIsDepartmentLogin(true);
                }}
              />
            )}
            <p
              className="mt-6 text-center text-sm text-gray-400 cursor-pointer hover:underline"
              onClick={() => setIsDepartmentLogin(!isDepartmentLogin)}
            >
              {isDepartmentLogin
                ? "Login as Faculty instead?"
                : "Login as Department instead?"}
            </p>
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
      <footer className="fixed bottom-4 right-4 text-sm text-gray-400 bg-gray-800/70 px-3 py-1 rounded-xl shadow-md backdrop-blur-sm">
        Made by{" "}
        <a
          href="https://github.com/Dharanish-AM"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          @dharanisham
        </a>
      </footer>
    </div>
  );
}
