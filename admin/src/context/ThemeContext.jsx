import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children, toastOptions = { duration: 5000 } }) {
  
  const [theme, setTheme] = useState("dark");
  const [showToast, setShowToast] = useState(false);

  
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, toastOptions.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, toastOptions]);

  
  const toggleTheme = () => {
    
    setShowToast(true);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, showToast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
