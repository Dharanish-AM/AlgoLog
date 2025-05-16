import React, { useEffect } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chart from "./pages/Chart.jsx";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store.js";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage.jsx";
import { checkTokenValidity, getClass } from "./services/authOperations.js";
import { GridLoader } from "react-spinners";

function AppContent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = React.useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCheckValidity = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const isTokenValid = await checkTokenValidity(token);
      console.log("Existing token validity:", isTokenValid);
      if (!isTokenValid) {
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }
      const classuser = await getClass(token);
      if (classuser) {
        dispatch({
          type: "SET_AUTH",
          payload: {
            isAuthenticated: true,
            class: classuser,
            token: token,
          },
        });
      }
      setLoading(false);
    };
    handleCheckValidity();
  }, [token]);

  if (loading) {
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
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<Chart />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AuthPage />} />
            </>
          )}
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
