import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import TSPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), TSPaths()],
});
