import React, { useEffect } from "react";
import logo from "/algolog.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747407322934.json";
import SignUpForm from "../components/SignUpForm";
import LoginForm from "../components/LoginForm";

export default function Auth({
  handleLogin,
  handleSignup,
  fetchDepartments,
  departments
}) {
  const [rollNo, setRollNo] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSignup, setIsSignup] = React.useState(false);

  useEffect(() => {
    if (isSignup) {
      fetchDepartments();
    }
  }, [fetchDepartments, isSignup]);

  const submitLogin = async () => {
    handleLogin(rollNo, password);
  };

  const submitSignup = async (formData) => {
    try {
      const res = await handleSignup(formData);
      console.log("submitSignup received result:", res);
      if (res) {
        setIsSignup(false);
        setRollNo("");
        setPassword("");
      } else {
        console.log("submitSignup: keeping modal open, result was false");
      }
      return res; // Return the result to SignUpForm
    } catch (err) {
      console.error("Signup error:", err);
      return false; // Return false on error
    }
  };

  return (
    <div className="min-h-screen h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-[#0f172a] to-[#0f172a] flex flex-col p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] animate-float"></div>
      </div>

      <div className="flex w-full items-center z-10 relative">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        />
        <h1 className="ml-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-tight">
          AlgoLog
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 z-10 relative">
        <div className="w-full sm:w-1/2 flex items-center justify-center p-4">
          {isSignup ? (
            <SignUpForm
              onClose={() => setIsSignup(false)}
              isOpen={isSignup}
              onSubmit={submitSignup}
            />
          ) : (
            <LoginForm
              submitLogin={submitLogin}
              rollNo={rollNo}
              setRollNo={setRollNo}
              password={password}
              setPassword={setPassword}
              setIsSignup={() => setIsSignup(true)}
            />
          )}
        </div>
        <div className="w-1/2 hidden sm:flex items-center justify-center p-8">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Simple glow behind animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl transform scale-75"></div>
            <Lottie
              animationData={Animation}
              loop
              autoplay
              className="w-full h-full max-w-lg drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
