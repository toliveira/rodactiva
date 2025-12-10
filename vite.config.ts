import { config } from "@dotenvx/dotenvx";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const envMode = mode ? mode : 'development';

  config({
    path: [
      `${process.cwd()}/.env`,
      `${process.cwd()}/.env.${envMode}`
    ],
    override: true
  });

  const plugins = [react(), tailwindcss()];

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    publicDir: path.resolve(import.meta.dirname, "client", "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "public"),
      emptyOutDir: true,
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
