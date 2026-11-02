import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Some tests run the full content build over every card.
    testTimeout: 30000,
  },
});
