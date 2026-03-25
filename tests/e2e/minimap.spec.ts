import { expect, test } from "@playwright/test";
import {
	clickAtPercentage,
	loadSong,
	locators,
	startPlayback,
} from "./helpers";

test.describe("Minimap Component", () => {
	test.beforeEach(async ({ page }) => {
		await loadSong(page);
	});

	test("should render minimap canvas", async ({ page }) => {
		const ui = locators(page);
		await expect(ui.minimapCanvas).toBeVisible();
		await expect(ui.minimapCanvas).toHaveClass(/cursor-pointer/);
	});

	test("should be clickable for seeking", async ({ page }) => {
		const ui = locators(page);
		const initialTime = await ui.timeDisplay.textContent();

		await clickAtPercentage(ui.minimapCanvas, 0.25);
		await page.waitForTimeout(200);
		await expect(ui.timeDisplay).not.toHaveText(initialTime || "");

		const earlyTime = await ui.timeDisplay.textContent();
		await clickAtPercentage(ui.minimapCanvas, 0.85);
		await page.waitForTimeout(200);
		const lateTime = await ui.timeDisplay.textContent();

		expect(earlyTime).not.toBe(lateTime);
	});

	test("should stay responsive after rapid seeks", async ({ page }) => {
		const ui = locators(page);

		await startPlayback(ui);

		for (const position of [0.1, 0.3, 0.6, 0.9]) {
			await clickAtPercentage(ui.minimapCanvas, position);
			await page.waitForTimeout(100);
		}

		await expect(ui.transportBar).toBeVisible();
	});
});
