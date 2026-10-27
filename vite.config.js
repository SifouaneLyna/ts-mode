import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BUILD_ID = String(Date.now());

export default defineConfig({
  plugins: [
    react(),
    {
      // /template/*.css are plain files copied as they are (their names never change), so browsers and
      // Hostinger kept serving the OLD css next to the NEW javascript. A new ?v= on every build forces a fresh copy.
      name: "version-template-css",
      transformIndexHtml(html) {
        return html.replace(
          /(href="\/template\/[^"?]+\.css)"/g,
          `$1?v=${BUILD_ID}"`,
        );
      },
    },
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
