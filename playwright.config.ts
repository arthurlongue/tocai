import { defineConfig, devices } from "@playwright/test";

const DEFAULT_WORKERS = 2;
const BASE_URL = "http://localhost:5173";
const DEV_SERVER_PORT = 5173;

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 30000,
	workers: DEFAULT_WORKERS,
	use: {
		baseURL: BASE_URL,
		viewport: { width: 1280, height: 720 },
	},
	webServer: {
		command: `pnpm dev -- --port ${DEV_SERVER_PORT} --strictPort`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
