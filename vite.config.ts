import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages URL: https://wagnerjales.github.io/financasmobile/
export default defineConfig({
  plugins: [react()],
  base: "/financasmobile/",
});
