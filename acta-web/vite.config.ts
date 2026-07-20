/**
 * @fileoverview Vite config for acta-web. Enables the React plugin and a stable
 * dev-server port so the acta-api CORS allowlist / VITE_API_BASE_URL default
 * line up during local development.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
