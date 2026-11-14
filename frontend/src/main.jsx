import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.jsx";
import { detectDemoMode } from "./features/demo/demo-mode.js";
import "./styles/global.css";

// Decide entre o fluxo real (Supabase) e o modo demonstração antes do primeiro render.
detectDemoMode().finally(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
