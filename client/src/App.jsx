import React from "react";
import Dashboard from "./pages/Dashboard.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chart from "./pages/Chart.jsx";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store.js";
import { Toaster } from "react-hot-toast";

function AppContent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<Chart />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
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
