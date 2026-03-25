import { expect, test } from "@playwright/test";
import { loadSong } from "./helpers";

test.describe("Responsive Design", () => {
	test("mobile layout snapshot", async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		await loadSong(page);

		await expect(page).toHaveScreenshot("mobile-layout-320px.png");
	});

	test("desktop layout snapshot", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await loadSong(page);

		await expect(page).toHaveScreenshot("desktop-layout-1280px.png");
	});
});
