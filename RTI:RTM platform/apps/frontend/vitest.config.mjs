import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "dist", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@feelwell/database": path.resolve(
        __dirname,
        "../../packages/database/src",
      ),
    },
  },
});
