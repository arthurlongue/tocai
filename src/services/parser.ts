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
