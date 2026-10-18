import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // During development, requests to /api go to the Express server.
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
});

