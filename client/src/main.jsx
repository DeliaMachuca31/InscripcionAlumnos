import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { AuthContext } from "./auth/auth-context.js";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContext value={{}}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AuthContext>
    </BrowserRouter>
  </StrictMode>,
);