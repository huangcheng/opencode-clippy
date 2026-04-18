import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "widget/renderer",
  base: "./",
  publicDir: resolve(__dirname, "assets/lottie"),
  build: {
    outDir: resolve(__dirname, "dist/widget/renderer"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "widget/renderer/index.html"),
    },
    copyPublicDir: true,
  },
  resolve: {
    alias: {
      "@assets": resolve(__dirname, "assets"),
    },
  },
});
