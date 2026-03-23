import { defineConfig } from "@playwright/experimental-ct-react";

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 30000,
	use: {
		viewport: { width: 1280, height: 720 },
		ctPort: 3100,
		ctViteConfig: {
			// Vite config for component testing
		},
	},
	projects: [
		{
			name: "chromium",
			use: { browserName: "chromium" },
		},
		{
			name: "firefox",
			use: { browserName: "firefox" },
		},
		{
			name: "webkit",
			use: { browserName: "webkit" },
		},
	],
});
