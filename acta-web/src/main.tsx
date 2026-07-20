/**
 * @fileoverview acta-web browser entry point — mounts the React root and loads
 * the Acta design tokens. At U-J U1 this renders only a health shell; the
 * full-bleed force canvas and chrome arrive in later milestones (U3+).
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
