import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import { initSentry } from "./lib/sentry";
import { initWebVitals } from "./lib/webVitals";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize Sentry for error monitoring
initSentry();

// Initialize Web Vitals for performance monitoring
initWebVitals();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
