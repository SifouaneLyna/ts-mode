import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BUILD_ID = String(Date.now());

export default defineConfig({
  plugins: [
    react(),
    {
      name: "build-version",
      closeBundle() {
        writeFileSync(
          resolve("dist/version.json"),
          JSON.stringify({ id: BUILD_ID }),
        );
      },
    },
  ],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
});
