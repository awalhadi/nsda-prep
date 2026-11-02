import { defineConfig, devices } from "@playwright/test";

// Runs against the production build: `npm run build` first (verify:full does this).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3200", ...devices["Pixel 7"] },
  webServer: { command: "npx next start -p 3200", url: "http://localhost:3200/cbta", reuseExistingServer: false, timeout: 120_000 },
});
