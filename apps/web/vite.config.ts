import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./apps/web/postcss.config.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@minihub/business-logic": path.resolve(
        __dirname,
        "../../packages/business-logic/src/index.ts"
      ),
    },
  },
});
