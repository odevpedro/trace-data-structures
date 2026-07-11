import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        prototype: resolve(__dirname, "prototype/trace_complete_market_v2.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
    exclude: ["e2e/**", "**/node_modules/**", "**/dist/**"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
