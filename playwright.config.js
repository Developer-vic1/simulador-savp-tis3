import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://127.0.0.1:5173", browserName: "chromium", launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader"] } },
  webServer: { command: "npm.cmd run dev -- --host 127.0.0.1", url: "http://127.0.0.1:5173", reuseExistingServer: true, timeout: 30000 },
});
