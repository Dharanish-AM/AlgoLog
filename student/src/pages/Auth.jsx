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
    <div className="min-h-screen h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-accent-pink/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      <div className="flex w-full items-center z-10 relative">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-14 h-14 object-contain]"
        />
        <h1 className="ml-3 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-pink tracking-tight drop-shadow-lg">
          AlgoLog
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 z-10 relative">
        <div className="w-full sm:w-1/2 flex items-center justify-center p-4">
          {isSignup ? (
            <div className="w-full max-w-2xl glass-card p-1 rounded-2xl shadow-2xl animate-fadeIn">
              <SignUpForm
                onClose={() => setIsSignup(false)}
                isOpen={isSignup}
                onSubmit={submitSignup}
              />
            </div>
          ) : (
            <div className="w-full max-w-md glass-card p-1 rounded-2xl shadow-2xl animate-fadeIn">
              <LoginForm
                submitLogin={submitLogin}
                rollNo={rollNo}
                setRollNo={setRollNo}
                password={password}
                setPassword={setPassword}
                setIsSignup={() => setIsSignup(true)}
              />
            </div>
          )}
        </div>
        <div className="w-1/2 hidden sm:flex items-center justify-center p-8">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Simple glow behind animation */}
            <div className="absolute inset-0 bg-primary-500/5 rounded-full blur-3xl transform scale-75"></div>
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
