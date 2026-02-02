import React from "react";
import logo from "/algolog.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747407322934.json";
import SignUpForm from "../components/SignUpForm";
import LoginForm from "../components/LoginForm";

export default function Auth({
  handleLogin,
  handleSignup,
}) {
  const [rollNo, setRollNo] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSignup, setIsSignup] = React.useState(false);


  const submitLogin = async () => {
    handleLogin(rollNo, password);
  };

  const submitSignup = async (formData) => {
    try {
      const res = await handleSignup(formData);
      if (res) {
        setIsSignup(false);
        setRollNo("");
        setPassword("");
      }
      // keep form open with current values when signup fails
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-[#141B2A] flex flex-col p-4 md:p-6 relative overflow-hidden">
      <div className="flex w-full items-center">
        <img
          src={logo}
          alt="AlgoLog Logo"
          className="w-12 md:w-14 h-12 md:h-14 object-contain"
        />
        <h1 className="ml-2 md:ml-3 text-xl md:text-2xl font-bold text-purple-400">AlgoLog</h1>
      </div>
      <div className="flex flex-col-reverse md:flex-row w-full h-full">
        <div className="w-full md:w-1/2 flex items-center justify-center min-h-[50%] md:min-h-full py-8 md:py-0">
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
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center min-h-[50%] md:min-h-full py-8 md:py-0">
          <Lottie
            animationData={Animation}
            loop
            autoplay
            className="w-full h-full max-w-md md:max-w-full"
          />
        </div>
      </div>
      <footer className="fixed bottom-4 right-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-xl shadow-md backdrop-blur-sm">
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
