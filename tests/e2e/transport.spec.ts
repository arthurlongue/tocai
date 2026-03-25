import { expect, test } from "@playwright/test";
import {
	loadSong,
	locators,
	pausePlayback,
	startPlayback,
} from "./helpers";

test.describe("Transport Bar Controls", () => {
	test.beforeEach(async ({ page }) => {
		await loadSong(page);
	});

	test("should have all required transport controls visible", async ({
		page,
	}) => {
		const ui = locators(page);

		await expect(ui.playButton).toBeVisible();
		await expect(ui.stopButton).toBeVisible();
		await expect(ui.seekSlider).toBeVisible();
		await expect(ui.speedSlider).toBeVisible();
		await expect(ui.volumeSlider).toBeVisible();
		await expect(ui.timeDisplay).toBeVisible();
	});

	test("should play, pause, and stop from the transport bar", async ({
		page,
	}) => {
		const ui = locators(page);
		const initialTime = await ui.timeDisplay.textContent();

		await startPlayback(ui);
		await page.waitForTimeout(500);
		await expect(ui.timeDisplay).not.toHaveText(initialTime || "");

		await pausePlayback(ui);
		await ui.stopButton.click();
		await expect(ui.playButton).toBeVisible();
	});

	test("should seek and change speed", async ({ page }) => {
		const ui = locators(page);
		const initialTime = await ui.timeDisplay.textContent();

		await ui.seekSlider.focus();
		await ui.seekSlider.press("End");
		await page.waitForTimeout(250);
		await expect(ui.timeDisplay).not.toHaveText(initialTime || "");

		await expect(page.getByText(/1\.00x/)).toBeVisible();
		await ui.speedSlider.focus();
		await ui.speedSlider.press("ArrowRight");
		await expect(page.getByText(/1\.25x/)).toBeVisible();
	});
});
