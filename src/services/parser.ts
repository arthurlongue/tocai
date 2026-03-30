import { parseTabFile } from "guitarpro-parser";
import { flattenSong } from "../domain/flattening";
import type { Song } from "../domain/types";

/**
 * Parses a Guitar Pro file (`.gp`, `.gp3`, `.gp5`, `.gpx`) into our internal Song format.
 *
 * This function runs in the main thread and uses the guitarpro-parser library to
 * parse the binary Guitar Pro file format, then flattens the hierarchical data
 * into our simple PlaybackNote array format suitable for playback and rendering.
 *
 * @param file - The Guitar Pro file object from input or drop
 * @returns A promise that resolves to our internal Song format
 * @throws Error if the file cannot be parsed
 *
 * @example
 * ```ts
 * const fileInput = document.querySelector('input[type="file"]');
 * fileInput.addEventListener('change', async (e) => {
 *   const file = e.target.files[0];
 *   const song = await parseFile(file);
 *   console.log(`Loaded: ${song.metadata.title}`);
 * });
 * ```
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
