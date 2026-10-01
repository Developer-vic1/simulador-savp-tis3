import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 550,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "three", test: /node_modules[\\/]three[\\/]/, maxSize: 400000, priority: 20 },
            { name: "vendor", test: /node_modules/, maxSize: 400000, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
