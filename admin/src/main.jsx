import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../context/ThemeContext.jsx";

if (import.meta.env.MODE === "production") {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Toaster
      position="bottom-right"
      toastOptions={{ style: { zIndex: 9999 } }}
    />
    <ThemeProvider toastOptions={{ duration: 9000 }}>
      <App />
    </ThemeProvider>
  </Provider>
);
