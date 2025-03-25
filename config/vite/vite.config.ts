import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        additionalData: `@use "@/styles/variables.scss" as *;`,
        sassOptions: {
          api: "modern",
          quietDeps: true,
          sourceMap: true,
          style: "compressed",
          loadPaths: ["src"],
          configFile: path.resolve(__dirname, "./config/styles/.sassrc.js"),
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envDir: "./config/environment",
});
