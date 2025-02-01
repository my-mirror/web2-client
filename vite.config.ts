import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import TSPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), TSPaths()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});