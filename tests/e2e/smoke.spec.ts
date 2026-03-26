import { expect, test } from "@playwright/test";
import { loadSong, locators } from "./helpers";

test.describe("Tocaí App - Core User Flow", () => {
	test("should display app title and upload interface", async ({ page }) => {
		const ui = locators(page);

		await page.goto("/");
		await expect(ui.title).toContainText(/Tocaí/i);
		await expect(ui.fileInput).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /upload guitar pro file/i }),
		).toBeVisible();
	});

	test("should return to upload state when loading another song", async ({
		page,
	}) => {
		const ui = await loadSong(page);

		await ui.uploadAnother.click();
		await expect(ui.fileInput).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /upload guitar pro file/i }),
		).toBeVisible();
	});
});
