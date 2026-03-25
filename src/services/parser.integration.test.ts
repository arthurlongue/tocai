import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFile } from "./parser";

describe("parseFile integration", () => {
	it("parses the checked-in GP5 fixture with the real parser", async () => {
		const fixturePath = resolve(process.cwd(), "tests/fixtures/test-song.gp5");
		const bytes = readFileSync(fixturePath);
		const file = new File([bytes], "test-song.gp5");

		const song = await parseFile(file);

		expect(song.metadata.title).toBe("Test Song");
		expect(song.metadata.artist).toBe("Test Artist");
		expect(song.tracks).toHaveLength(1);
		expect(song.tracks[0]?.name).toBe("Guitar");
		expect(song.tracks[0]?.notes.length).toBeGreaterThan(0);
		expect(song.durationSeconds).toBeGreaterThan(5);
	});
});
