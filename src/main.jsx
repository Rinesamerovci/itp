import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { TranslationProvider } from "./hooks/useTranslation";
import { ToastProvider } from "./hooks/useToast";
import { RoleProvider } from "./context/RoleContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <ToastProvider>
          <RoleProvider>
            <App />
          </RoleProvider>
        </ToastProvider>
      </TranslationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
