import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { getAdminUser } from "./services/authOperations";
import { GridLoader } from "react-spinners";
import Chart from "./pages/Chart";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const checkToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await getAdminUser(token);
        if (response?.status === 200) {
          dispatch({
            type: "SET_AUTH",
            payload: {
              token,
              user: response.data.admin,
              isAuthenticated: true,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  if (loading) {
    return (
      <div className="bg-[#161F2D] flex justify-center items-center w-screen h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dept/:deptId" element={<Dashboard />} />
            <Route path="/dept/:deptId/class/:id" element={<Dashboard />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="*" element={<Dashboard />} />
          </>
        ) : (
          <Route path="/" element={<Auth />} />
        )}
      </Routes>
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
    </BrowserRouter>
  );
}

export default App;
