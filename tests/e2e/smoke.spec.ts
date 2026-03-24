import { test, expect } from "@playwright/test";

test.describe("Tocaí App - Core User Flow", () => {
	test("should display app title and upload interface", async ({ page }) => {
		await page.goto("/");

		// Verify the app loads with the correct title
		await expect(page.locator("h1")).toContainText(/Tocaí/i);

		// Verify upload interface is visible
		await expect(page.getByText(/upload/i)).toBeVisible();
	});

	test("should have proper page structure", async ({ page }) => {
		await page.goto("/");

		// Verify main sections exist
		await expect(page.locator("#center")).toBeVisible();
		await expect(page.locator("#next-steps")).toBeVisible();

		// Verify hero section
		await expect(page.locator(".hero")).toBeVisible();
		await expect(page.locator(".hero h1")).toContainText(/Tocaí/i);
	});

	test("should display file upload component", async ({ page }) => {
		await page.goto("/");

		// Verify file upload interface exists
		const uploadSection = page.locator('input[type="file"]');
		await expect(uploadSection).toBeVisible();

		// Verify upload label/instructions
		await expect(page.getByText(/guitar pro/i)).toBeVisible();
	});

	test("should show song info after upload", async ({ page }) => {
		await page.goto("/");

		// Upload a test Guitar Pro file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Wait for song to load and display
		await expect(page.locator("h2")).toBeVisible();
		await expect(page.locator(".text-muted-foreground")).toBeVisible();

		// Verify song metadata section
		await expect(page.getByText(/duration/i)).toBeVisible();
		await expect(page.getByText(/tracks/i)).toBeVisible();
	});

	test("should display transport bar after song loads", async ({ page }) => {
		await page.goto("/");

		// Upload a test file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Wait for transport bar to appear
		await expect(page.locator(".transport-bar")).toBeVisible();

		// Verify playback controls
		await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();
	});

	test("should display minimap after song loads", async ({ page }) => {
		await page.goto("/");

		// Upload a test file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Wait for minimap canvas to appear
		const minimapCanvas = page.locator("canvas.cursor-pointer");
		await expect(minimapCanvas).toBeVisible();

		// Verify minimap has correct height
		const box = await minimapCanvas.boundingBox();
		expect(box?.height).toBeGreaterThan(0);
	});

	test("should display visualizer after song loads", async ({ page }) => {
		await page.goto("/");

		// Upload a test file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Wait for visualizer to appear
		await expect(page.locator(".visualizer")).toBeVisible();
		await expect(page.locator("canvas")).toBeVisible();
	});

	test("should allow uploading another song", async ({ page }) => {
		await page.goto("/");

		// Upload first file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Wait for song to load
		await expect(page.locator("h2")).toBeVisible();

		// Click "Upload Another Song"
		await page.getByRole("button", { name: /upload another/i }).click();

		// Verify upload interface is visible again
		await expect(page.locator('input[type="file"]')).toBeVisible();
	});
});
