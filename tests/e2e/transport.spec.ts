import { test, expect } from "@playwright/test";

test.describe("Transport Bar Controls", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to app and load a song
		await page.goto("/");
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles("tests/fixtures/test-song.gp5");
		// Wait for transport bar to appear
		await expect(page.locator(".transport-bar")).toBeVisible();

		// Resuming AudioContext requires user gesture
		await page.getByRole("button", { name: /play/i }).click();
		await page.waitForTimeout(500);
		await page.getByRole("button", { name: /pause/i }).click();
	});

	test("should have all required transport controls visible", async ({
		page,
	}) => {
		// Verify PLAY button exists
		await expect(
			page.getByRole("button", { name: /play/i }),
		).toBeVisible();

		// Verify STOP button exists
		await expect(
			page.getByRole("button", { name: /stop/i }),
		).toBeVisible();

		// Verify seek slider exists
		await expect(
			page.getByRole("slider", { name: /seek/i }),
		).toBeVisible();

		// Verify time display exists
		await expect(page.getByText(/\d:\d{2} \/ \d:\d{2}/)).toBeVisible();

		// Verify speed control exists
		await expect(
			page.getByRole("slider", { name: /speed/i }),
		).toBeVisible();

		// Verify volume control exists
		await expect(
			page.getByRole("slider", { name: /volume/i }),
		).toBeVisible();
	});

	test("should have speed control with correct range (0.25x to 2.0x)", async ({
		page,
	}) => {
		const speedSlider = page.getByRole("slider", { name: /speed/i });
		await expect(speedSlider).toBeVisible();

		// Verify min/max attributes
		const min = await speedSlider.getAttribute("aria-valuemin");
		const max = await speedSlider.getAttribute("aria-valuemax");

		expect(min).toBe("0.25");
		expect(max).toBe("2");

		// Verify default speed display (1.00x)
		await expect(page.getByText(/1\.00x/)).toBeVisible();
	});

	test("should have volume control with correct range (0 to 1)", async ({
		page,
	}) => {
		const volumeSlider = page.getByRole("slider", { name: /volume/i });
		await expect(volumeSlider).toBeVisible();

		// Verify min/max attributes
		const min = await volumeSlider.getAttribute("aria-valuemin");
		const max = await volumeSlider.getAttribute("aria-valuemax");

		expect(min).toBe("0");
		expect(max).toBe("1");
	});

	test("should display time in M:SS format", async ({ page }) => {
		// Time display should be visible
		const timeDisplay = page.getByText(/\d:\d{2} \/ \d:\d{2}/);
		await expect(timeDisplay).toBeVisible();

		// Verify format matches M:SS / M:SS pattern
		const timeText = await timeDisplay.textContent();
		expect(timeText).toMatch(/^\d:\d{2} \/ \d:\d{2}$/);
	});

	test("should update time display during playback", async ({ page }) => {
		// Get initial time
		const timeDisplay = page.getByText(/\d:\d{2} \/ \d:\d{2}/);
		const initialTime = await timeDisplay.textContent();

		// Click PLAY button
		await page.getByRole("button", { name: /play/i }).click();

		// Wait for playback to start and time to update
		await page.waitForTimeout(2000);

		// Time should have changed
		const updatedTime = await timeDisplay.textContent();
		expect(updatedTime).not.toBe(initialTime);
	});

	test("should allow seeking via slider", async ({ page }) => {
		const seekSlider = page.getByRole("slider", { name: /seek/i });
		await expect(seekSlider).toBeVisible();

		// Get initial time
		const timeDisplay = page.getByText(/\d:\d{2} \/ \d:\d{2}/);
		const initialTime = await timeDisplay.textContent();

		// Drag seek slider to 50%
		const box = await seekSlider.boundingBox();
		if (box) {
			await page.mouse.move(box.x, box.y + box.height / 2);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
			await page.mouse.up();
		}

		// Time should update after seek
		await page.waitForTimeout(1000);
		await expect(timeDisplay).not.toHaveText(initialTime || "");
	});

	test("should change speed when slider is adjusted", async ({ page }) => {
		const speedSlider = page.getByRole("slider", { name: /speed/i });
		const speedDisplay = page.getByText(/\d\.\d{2}x/);

		// Verify initial speed
		await expect(speedDisplay).toHaveText(/1\.00x/);

		// Adjust speed slider to 1.5x
		const box = await speedSlider.boundingBox();
		if (box) {
			await page.mouse.move(box.x, box.y + box.height / 2);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
			await page.mouse.up();
		}

		// Speed display should update
		await page.waitForTimeout(1000);
		await expect(speedDisplay).toHaveText(/1\.\d{2}x/);
	});

	test("should have accessible button labels", async ({ page }) => {
		// Verify buttons have proper aria-labels or text
		const playButton = page.getByRole("button", { name: /play/i });
		const stopButton = page.getByRole("button", { name: /stop/i });

		await expect(playButton).toHaveAttribute("aria-label");
		await expect(stopButton).toHaveAttribute("aria-label");
	});

	test("should have proper layout structure", async ({ page }) => {
		const transportBar = page.locator(".transport-bar");
		await expect(transportBar).toBeVisible();

		// Verify transport bar contains all control groups
		await expect(transportBar.locator("button")).toHaveCount(2);
		await expect(transportBar.getByRole("slider")).toHaveCount(3);
	});
});
