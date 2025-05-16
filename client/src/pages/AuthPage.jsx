import React from "react";
import Header from "../components/Header";
import Illustration from "../assets/Coding workshop-bro.png";
import Lottie from "lottie-react";
import Animation from "../assets/Animation - 1747373498451.json";
import { useState } from "react";
import StudentLogin from "../components/StudentLogin";
import logo from "../../../client/algolog.png";
import TutorLogin from "../components/TutorLogin";
import Animation1 from "../assets/Animation - 1747407322934.json";

export default function AuthPage() {
  const [isStudent, setIsSignup] = useState(false);

  return (
    <div
      style={{
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1rem",
        minHeight: "100vh",
        background: "#141B2A",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "1rem",
          top: "1rem",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <img
          src={logo}
          alt="AlgoLog Logo"
          style={{
            width: "3.5rem",
            height: "3.5rem",
            aspectRatio: "1",
          }}
        />
        <h1
          style={{
            marginLeft: "0.75rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#C084FC",
          }}
        >
          AlgoLog
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              marginTop: "2.5rem",
              width: "25rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              borderRadius: "1rem",
              padding: "1.5rem",
              backdropFilter: "blur(8px)",
              border: "0.5px solid #7E8391",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
                color: "#F9FAFB",
                textAlign: "center",
              }}
            >
              Welcome back, {isStudent ? "Student" : "Tutor"}!
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <button
                onClick={() => setIsSignup(false)}
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "background-color 0.3s, color 0.3s",
                  width: "50%",
                  backgroundColor: !isStudent ? "#9333ea" : "#e5e7eb",
                  color: !isStudent ? "#ffffff" : "#1f2937",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Tutor
              </button>
              <button
                onClick={() => setIsSignup(true)}
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "background-color 0.3s, color 0.3s",
                  width: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isStudent ? "#9333ea" : "#e5e7eb",
                  color: isStudent ? "#ffffff" : "#1f2937",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Student
              </button>
            </div>
            {isStudent ? (
              <>
                <StudentLogin />
              </>
            ) : (
              <>
                <TutorLogin />
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
          }}
        >
          <Lottie
            animationData={isStudent ? Animation1 : Animation}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
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
