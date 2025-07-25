import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chart from "./pages/Chart.jsx";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store.js";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage.jsx";
import {
  checkTokenValidity,
  handleGetUser,
} from "./services/authOperations.js";
import { GridLoader } from "react-spinners";
import DepartmentDash from "./pages/department/DepartmentDash.jsx";
import ClassList from "./pages/department/ClassList.jsx";
import DepartmentChart from "./pages/department/DepartmentChart.jsx";

function AppContent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role); //class, department
  const token = localStorage.getItem("token");
  localStorage.setItem("theme", "dark");
  const [loading, setLoading] = React.useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCheckValidity = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const isTokenValid = await checkTokenValidity(token);
        console.log("Existing token validity:", isTokenValid);
        if (!isTokenValid) {
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }
        const res = await handleGetUser(token);
        if (res) {
          dispatch({
            type: "SET_AUTH",
            payload: {
              isAuthenticated: true,
              class: res.user,
              department: res.user,
              token: token,
              role: res.role,
            },
          });
        }
      } catch (error) {
        console.error("Token validation failed with error:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    handleCheckValidity();
  }, [token]);

  if (loading && !role) {
    return (
      <div className="bg-[#161F2D] flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );
  }

  return (
    <ThemeProvider toastOptions={{ duration: 9000 }}>
      <BrowserRouter>
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<AuthPage />} />
              <Route path="*" element={<AuthPage />} />
            </>
          ) : role === "class" ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<Chart />} />
              <Route path="*" element={<Dashboard />} />
            </>
          ) : role === "department" ? (
            <>
              <Route path="/" element={<DepartmentDash />} />
              <Route path="/class/:id" element={<ClassList />} />
              <Route path="/chart" element={<DepartmentChart />} />
              <Route path="/chart/class/:id" element={<DepartmentChart />} />
              <Route path="*" element={<DepartmentDash />} />
            </>
          ) : null}
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
