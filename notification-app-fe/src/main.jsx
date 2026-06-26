import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configure } from "logging-middleware";
import { getEvalConfig } from "./config/evalConfig.js";
import "./index.css";
import App from "./App.jsx";

configure({
  ...getEvalConfig(),
  EVAL_BASE_URL: "/evaluation-service",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
