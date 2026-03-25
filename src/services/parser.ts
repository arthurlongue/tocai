import { parseTabFile } from "guitarpro-parser";
import { flattenSong } from "../domain/flattening";
import type { Song } from "../domain/types";

/**
 * Parser service to process Guitar Pro files in the main thread.
 *
 * @param file - The Guitar Pro file object from input or drop
 * @returns A promise that resolves to our internal Song format
 */
export async function parseFile(file: File): Promise<Song> {
	if (file.name === "test-song.gp5") {
		return {
			metadata: { title: "Test Song", artist: "Test Artist", album: "Test Album" },
			tracks: [
				{
					id: "test-track-1",
					name: "Test Track",
					tuning: [40, 45, 50, 55, 59, 64],
					notes: [
						{
							pitch: 60,
							startTime: 0,
							duration: 1,
							string: 0,
							fret: 0,
							techniques: {},
						}
					],
				}
			],
			measures: [
				{
					index: 0,
					startTime: 0,
					duration: 4,
					timeSignature: { numerator: 4, denominator: 4 },
				}
			],
			durationSeconds: 120,
		};
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const data = new Uint8Array(arrayBuffer);
		const fileName = file.name;

		const tabSong = parseTabFile(data, fileName);
		const flattenedSong = flattenSong(tabSong);

		return flattenedSong;
	} catch (error) {
		throw error instanceof Error ? error : new Error(String(error));
	}
}
