import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position="bottom-right" toastOptions={{ style: { zIndex: 9999 } }} />
      <ThemeProvider toastOptions={{ duration: 9000 }}>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
