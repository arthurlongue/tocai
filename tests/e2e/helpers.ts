import { expect, type Locator, type Page } from "@playwright/test";

export const SONG_FIXTURE = "tests/fixtures/test-song.gp5";

export const locators = (page: Page) => ({
	fileInput: page.locator('input[type="file"]'),
	transportBar: page.locator(".transport-bar"),
	minimapCanvas: page.locator("canvas.cursor-pointer"),
	visualizerCanvas: page.locator(".visualizer canvas"),
	title: page.locator("h1"),
	songTitle: page.locator("h2").first(),
	metadata: page.locator(
		".w-full.max-w-md.mx-auto p.text-lg.text-muted-foreground",
	),
	duration: page.getByText(/duration/i),
	tracks: page.locator(".w-full.max-w-md.mx-auto").getByText(/tracks/i),
	playButton: page.getByRole("button", { name: /play/i }),
	pauseButton: page.getByRole("button", { name: /pause/i }),
	stopButton: page.getByRole("button", { name: /stop/i }),
	seekSlider: page.getByRole("slider", { name: /seek/i }),
	speedSlider: page.getByRole("slider", { name: /speed/i }),
	volumeSlider: page.locator(".transport-bar").getByRole("slider", { name: /volume/i }),
	timeDisplay: page.getByText(/\d:\d{2} \/ \d:\d{2}/),
	uploadAnother: page.getByRole("button", { name: /upload another/i }),
});

export async function loadSong(page: Page) {
	const ui = locators(page);

	await page.goto("/");
	await expect(ui.fileInput).toBeVisible();
	await ui.fileInput.setInputFiles(SONG_FIXTURE);

	await expect(ui.songTitle).toBeVisible();
	await expect(ui.metadata).toBeVisible();
	await expect(ui.transportBar).toBeVisible();
	await expect(ui.minimapCanvas).toBeVisible();
	await expect(ui.visualizerCanvas).toBeVisible();

	return ui;
}

export async function clickAtPercentage(
	locator: Locator,
	percentage: number,
	yPercentage = 0.5,
) {
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error("Target element not found");
	}

	await locator.click({
		position: {
			x: box.width * percentage,
			y: box.height * yPercentage,
		},
	});
}

export async function startPlayback(ui: ReturnType<typeof locators>) {
	await ui.playButton.click();
	await expect(ui.pauseButton).toBeVisible();
}

export async function pausePlayback(ui: ReturnType<typeof locators>) {
	await ui.pauseButton.click();
	await expect(ui.playButton).toBeVisible();
}
