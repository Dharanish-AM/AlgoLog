import React, { useEffect } from "react";
import StudentProfile from "./pages/StudentProfile";
import Auth from "./pages/Auth";
import toast, { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { GridLoader } from "react-spinners";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [student, setStudent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [departments, setDepartments] = React.useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getStudent();
    }
    if (!token) setIsLoading(false);
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/departments`
      );
      setDepartments(response.data.departments);
      console.log(response.data.departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
      toast.error("Failed to fetch departments.");
    }
  };

  const handleLogin = async (rollNo, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/student/login`,
        {
          rollNo,
          password,
        }
      );

      if (response.data?.token) {
        toast.success("Login successful!");
        setIsAuthenticated(true);
        localStorage.setItem("token", response.data.token);
        console.log("Login successful:", response.data);
        getStudent();
      }
    } catch (err) {
      console.error("Login failed:", err?.response?.data || err.message);
      toast.error(
        "Login failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (formData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students`,
        formData
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Signup successful:", response.data);
        toast.success("Signup Successful!");
        return true;
      }
    } catch (err) {
      console.error("Signup failed:", err?.response?.data || err.message);
      toast.error(
        "Signup failed: " + (err.response?.data?.message || err.message)
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        setIsLoading(false);
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/student/get-student`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudent(response.data.student);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    setStudent(null);
    window.location.reload();
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/students/refetch/single?id=${
          student._id
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setStudent(response.data.student);
        toast.success("Data refreshed successfully!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to refresh data. ", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdate = async (updatedStudent) => {
    try {
      const { _id, ...data } = updatedStudent;

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/students/${_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setStudent(response.data.student);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to update profile: ${err.response?.data?.error || err.message}`
      );
    }
  };

  const handleUpdatePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/student/change-password`,
        {
          studentId: student._id,
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Password updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to update password: ${err.response?.data?.error || err.message}`
      );
    }
  };

  if (isLoading)
    return (
      <div className="bg-[#161F2D] flex justify-center items-center h-screen">
        <GridLoader color="#C084FC" size={20} />
      </div>
    );

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route
            path="*"
            element={
              <Auth
                handleSignup={handleSignup}
                fetchDepartments={fetchDepartments}
                handleLogin={handleLogin}
                departments={departments}
              />
            }
          />
        ) : (
          <Route
            path="*"
            element={
              <StudentProfile
                handleRefresh={handleRefresh}
                handleLogout={handleLogout}
                student={student}
                isRefreshing={isRefreshing}
                handleUpdatePassword={handleUpdatePassword}
                handleUpdate={handleUpdate}
              />
            }
          />
        )}
      </Routes>
      <Toaster position="bottom-right" />
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
    </Router>
  );
}

export default App;
