import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Song } from "../domain/types";
import { parseFile } from "../services/parser";
import { saveFile } from "../services/storage";
import { FileUpload } from "./FileUpload";

vi.mock("../services/parser", () => ({
	parseFile: vi.fn(),
}));

vi.mock("../services/storage", () => ({
	saveFile: vi.fn(),
}));

const mockSong: Song = {
	metadata: {
		title: "Test Song",
		artist: "Test Artist",
		album: "Test Album",
	},
	tracks: [],
	measures: [],
	durationSeconds: 42,
};

describe("FileUpload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads the song before kicking off persistence", async () => {
		const onSongLoaded = vi.fn();
		const onError = vi.fn();
		const file = new File(["gp data"], "song.gp5");
		const eventOrder: string[] = [];

		vi.mocked(parseFile).mockImplementation(async () => {
			eventOrder.push("parse");
			return mockSong;
		});
		vi.mocked(saveFile).mockImplementation(async () => {
			eventOrder.push("save");
		});

		const { container } = render(
			<FileUpload onSongLoaded={onSongLoaded} onError={onError} />,
		);
		const input = container.querySelector('input[type="file"]');

		expect(input).not.toBeNull();

		fireEvent.change(input as HTMLInputElement, {
			target: { files: [file] },
		});

		await waitFor(() => {
			expect(onSongLoaded).toHaveBeenCalledWith(mockSong);
		});

		expect(onError).not.toHaveBeenCalled();
		expect(eventOrder).toEqual(["parse", "save"]);
		expect(saveFile).toHaveBeenCalledWith(file.name, file);
	});

	it("surfaces parse failures without trying to persist", async () => {
		const onSongLoaded = vi.fn();
		const onError = vi.fn();
		const file = new File(["bad data"], "broken.gp5");
		const parseError = new Error("Parse failed");

		vi.mocked(parseFile).mockRejectedValue(parseError);

		const { container } = render(
			<FileUpload onSongLoaded={onSongLoaded} onError={onError} />,
		);
		const input = container.querySelector('input[type="file"]');

		expect(input).not.toBeNull();

		fireEvent.change(input as HTMLInputElement, {
			target: { files: [file] },
		});

		await waitFor(() => {
			expect(onError).toHaveBeenCalledWith(parseError);
		});

		expect(onSongLoaded).not.toHaveBeenCalled();
		expect(saveFile).not.toHaveBeenCalled();
	});
});
