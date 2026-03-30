import { parseTabFile } from "guitarpro-parser";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flattenSong } from "../domain/flattening";
import { parseFile } from "./parser";

vi.mock("guitarpro-parser", () => ({
	parseTabFile: vi.fn(),
}));

vi.mock("../domain/flattening", () => ({
	flattenSong: vi.fn(),
}));

describe("parseFile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("always uses the parse pipeline for test-song.gp5", async () => {
		const bytes = new Uint8Array([1, 2, 3, 4]);
		const file = new File([bytes], "test-song.gp5");
		const arrayBufferSpy = vi.fn(async () => bytes.buffer);

		Object.defineProperty(file, "arrayBuffer", {
			value: arrayBufferSpy,
		});

		const parsedSong = { tracks: [] };
		const flattenedSong = {
			metadata: { title: "Parsed", artist: "Artist", album: "" },
			keySignatures: [],
			tracks: [],
			measures: [],
			durationSeconds: 0,
		};

		vi.mocked(parseTabFile).mockReturnValue(parsedSong as never);
		vi.mocked(flattenSong).mockReturnValue(flattenedSong);

		await expect(parseFile(file)).resolves.toEqual(flattenedSong);
		expect(arrayBufferSpy).toHaveBeenCalledTimes(1);
		expect(parseTabFile).toHaveBeenCalledWith(bytes, "test-song.gp5");
		expect(flattenSong).toHaveBeenCalledWith(parsedSong);
	});
});
