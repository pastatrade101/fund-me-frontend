import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { UIProvider } from "./ui/UIProvider";
import { AppThemeProvider } from "./ui/AppThemeProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <UIProvider>
                <AppThemeProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </AppThemeProvider>
            </UIProvider>
        </BrowserRouter>
    </React.StrictMode>
);
