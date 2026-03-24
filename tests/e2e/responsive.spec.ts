import { test, expect, devices } from "@playwright/test";

test.describe("Responsive Design", () => {
	test("mobile layout (320px width)", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 320, height: 640 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Verify app title is visible
		await expect(page.locator("h1")).toContainText(/Tocaí/i);

		// Verify upload interface is visible and usable
		await expect(page.locator('input[type="file"]')).toBeVisible();

		// Load a song to test responsive layout with all components
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components are visible in mobile layout
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible(); // minimap
		await expect(page.locator(".visualizer")).toBeVisible();

		// Verify transport controls are stacked/accessible
		const playButton = page.getByRole("button", { name: /play/i });
		await expect(playButton).toBeVisible();

		// Verify touch targets meet WCAG standards (44x44px minimum)
		const buttons = page.getByRole("button");
		const count = await buttons.count();
		for (let i = 0; i < count; i++) {
			const button = buttons.nth(i);
			const box = await button.boundingBox();
			if (box) {
				expect(box.width).toBeGreaterThanOrEqual(44);
				expect(box.height).toBeGreaterThanOrEqual(44);
			}
		}

		// Verify sliders are usable on mobile
		const sliders = page.getByRole("slider");
		const sliderCount = await sliders.count();
		for (let i = 0; i < sliderCount; i++) {
			const slider = sliders.nth(i);
			await expect(slider).toBeVisible();
		}

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("mobile-layout-320px.png");

		await context.close();
	});

	test("small mobile layout (375px - iPhone 14)", async ({ browser }) => {
		const context = await browser.newContext({
			...devices["iPhone 14"],
		});
		const page = await context.newPage();

		await page.goto("/");

		// Verify app loads correctly on iPhone 14
		await expect(page.locator("h1")).toContainText(/Tocaí/i);

		// Load a song
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components render
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible();

		// Verify controls are accessible
		await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("mobile-layout-375px-iphone14.png");

		await context.close();
	});

	test("tablet layout (768px width)", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 768, height: 1024 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Load a song
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components are visible
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible();
		await expect(page.locator(".visualizer")).toBeVisible();

		// Verify transport bar layout (should be more horizontal than mobile)
		const transportBar = page.locator(".transport-bar");
		const box = await transportBar.boundingBox();
		if (box) {
			// Transport bar should be wider on tablet
			expect(box.width).toBeGreaterThanOrEqual(600);
		}

		// Verify all controls are present
		await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /seek/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /speed/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /volume/i })).toBeVisible();

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("tablet-layout-768px.png");

		await context.close();
	});

	test("tablet landscape layout (1024px width)", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 1024, height: 768 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Load a song
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components are visible
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible();
		await expect(page.locator(".visualizer")).toBeVisible();

		// Verify layout is properly arranged
		const transportBar = page.locator(".transport-bar");
		await expect(transportBar).toBeVisible();

		// Verify time display is visible
		await expect(page.getByText(/\d:\d{2} \/ \d:\d{2}/)).toBeVisible();

		// Verify speed display shows 1.00x
		await expect(page.getByText(/1\.00x/)).toBeVisible();

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("tablet-landscape-1024px.png");

		await context.close();
	});

	test("desktop layout (1280px width)", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 1280, height: 720 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Load a song
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components are visible
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible();
		await expect(page.locator(".visualizer")).toBeVisible();

		// Verify full layout with all controls
		await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /stop/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /seek/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /speed/i })).toBeVisible();
		await expect(page.getByRole("slider", { name: /volume/i })).toBeVisible();

		// Verify time and speed displays
		await expect(page.getByText(/\d:\d{2} \/ \d:\d{2}/)).toBeVisible();
		await expect(page.getByText(/1\.00x/)).toBeVisible();

		// Verify song info section
		await expect(page.locator("h2")).toBeVisible();
		await expect(page.locator(".text-muted-foreground")).toBeVisible();

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("desktop-layout-1280px.png");

		await context.close();
	});

	test("large desktop layout (1920px width)", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 1920, height: 1080 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Load a song
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Verify all components scale properly
		await expect(page.locator(".transport-bar")).toBeVisible();
		await expect(page.locator("canvas.cursor-pointer")).toBeVisible();
		await expect(page.locator(".visualizer")).toBeVisible();

		// Verify content doesn't overflow
		const transportBar = page.locator(".transport-bar");
		const box = await transportBar.boundingBox();
		if (box) {
			expect(box.width).toBeLessThanOrEqual(1920);
		}

		// Take screenshot for visual regression
		await expect(page).toHaveScreenshot("desktop-layout-1920px.png");

		await context.close();
	});

	test("touch targets meet WCAG standards on mobile", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 320, height: 640 },
		});
		const page = await context.newPage();

		await page.goto("/");

		// Load a song to show transport controls
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

		// Check all buttons meet WCAG touch target standards (44x44px minimum)
		const buttons = page.getByRole("button");
		const count = await buttons.count();

		for (let i = 0; i < count; i++) {
			const button = buttons.nth(i);
			const box = await button.boundingBox();
			if (box) {
				expect(box.width).toBeGreaterThanOrEqual(44);
				expect(box.height).toBeGreaterThanOrEqual(44);
			}
		}

		// Check sliders are accessible
		const sliders = page.getByRole("slider");
		const sliderCount = await sliders.count();
		for (let i = 0; i < sliderCount; i++) {
			const slider = sliders.nth(i);
			const box = await slider.boundingBox();
			if (box) {
				// Slider track should be at least 44px in one dimension
				expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(44);
			}
		}

		await context.close();
	});

	test("playback controls are accessible at all breakpoints", async ({
		browser,
	}) => {
		const viewports = [
			{ width: 320, height: 640, name: "mobile" },
			{ width: 768, height: 1024, name: "tablet" },
			{ width: 1280, height: 720, name: "desktop" },
		];

		for (const viewport of viewports) {
			const context = await browser.newContext({
				viewport: { width: viewport.width, height: viewport.height },
			});
			const page = await context.newPage();

			await page.goto("/");

			// Load a song
			const fileInput = page.locator('input[type="file"]');
			await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

			// Verify PLAY button is clickable
			const playButton = page.getByRole("button", { name: /play/i });
			await expect(playButton).toBeVisible();
			await playButton.click();

			// Verify STOP button is clickable
			const stopButton = page.getByRole("button", { name: /stop/i });
			await expect(stopButton).toBeVisible();
			await stopButton.click();

			// Verify sliders are interactive
			const seekSlider = page.getByRole("slider", { name: /seek/i });
			await expect(seekSlider).toBeVisible();

			await context.close();
		}
	});

	test("minimap is clickable at all breakpoints", async ({ browser }) => {
		const viewports = [
			{ width: 320, height: 640 },
			{ width: 768, height: 1024 },
			{ width: 1280, height: 720 },
		];

		for (const viewport of viewports) {
			const context = await browser.newContext({
				viewport: { width: viewport.width, height: viewport.height },
			});
			const page = await context.newPage();

			await page.goto("/");

			// Load a song
			const fileInput = page.locator('input[type="file"]');
			await fileInput.setInputFiles("tests/fixtures/test-song.gp5");

			// Verify minimap is visible and clickable
			const canvas = page.locator("canvas.cursor-pointer");
			await expect(canvas).toBeVisible();

			// Click minimap
			const box = await canvas.boundingBox();
			if (box) {
				await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
				await page.waitForTimeout(200);

				// Time display should update
				await expect(page.getByText(/\d:\d{2} \/ \d:\d{2}/)).toBeVisible();
			}

			await context.close();
		}
	});
});
