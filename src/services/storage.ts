import localforage from "localforage";
import type { Song } from "../domain/types";

localforage.config({
	driver: localforage.INDEXEDDB,
	name: "tocai-songs",
	storeName: "library",
});

const SONG_KEY_PREFIX = "song-";

const getSongKey = (name: string): string => `${SONG_KEY_PREFIX}${name}`;

const isSong = (value: unknown): value is Song => {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<Song>;

	return (
		!!candidate.metadata &&
		typeof candidate.metadata.title === "string" &&
		typeof candidate.metadata.artist === "string" &&
		typeof candidate.metadata.album === "string" &&
		Array.isArray(candidate.tracks) &&
		Array.isArray(candidate.measures) &&
		typeof candidate.durationSeconds === "number"
	);
};

/**
 * Saves a parsed Song object to IndexedDB.
 *
 * @param name - Unique identifier for the song
 * @param song - The Song object to store
 */
export async function saveSong(name: string, song: Song): Promise<void> {
	await localforage.setItem(getSongKey(name), song);
}

/**
 * Retrieves a parsed Song object from IndexedDB.
 *
 * @param name - The identifier of the song to retrieve
 * @returns The Song object, or null if not found
 */
export async function getSong(name: string): Promise<Song | null> {
	const storedValue = await localforage.getItem<unknown>(getSongKey(name));
	return isSong(storedValue) ? storedValue : null;
}

/**
 * Sets the current song name in localStorage (for session persistence).
 *
 * @param name - The name of the current song
 */
export async function setCurrentSong(name: string): Promise<void> {
	localStorage.setItem("current-song-name", name);
}

/**
 * Gets the name of the current song from localStorage.
 *
 * @returns The current song name, or null if none is set
 */
export async function getCurrentSongName(): Promise<string | null> {
	return localStorage.getItem("current-song-name");
}

/**
 * Lists all saved songs in the library.
 *
 * @returns An array of objects containing song names and their corresponding Song data
 */
export async function listSongs(): Promise<{ name: string; song: Song }[]> {
	const keys = await localforage.keys();
	const songKeys = keys.filter((key) => key.startsWith(SONG_KEY_PREFIX));
	const songs = await Promise.all(
		songKeys.map(async (key) => {
			const storedValue = await localforage.getItem<unknown>(key);
			if (!isSong(storedValue)) {
				return null;
			}

			return {
				name: key.slice(SONG_KEY_PREFIX.length),
				song: storedValue,
			};
		}),
	);
	return songs.filter(
		(song): song is { name: string; song: Song } => song !== null,
	);
}

/**
 * Deletes a song and its associated raw file from storage.
 * Also clears the current song if it matches the deleted one.
 *
 * @param name - The name of the song to delete
 */
export async function deleteSong(name: string): Promise<void> {
	await localforage.removeItem(getSongKey(name));
	// Cleanup legacy raw uploads from older versions that stored the original file.
	await localforage.removeItem(name);
	const current = await getCurrentSongName();
	if (current === name) {
		localStorage.removeItem("current-song-name");
	}
}

/**
 * Clears all stored data from IndexedDB and localStorage.
 */
export async function clearStorage(): Promise<void> {
	await localforage.clear();
	localStorage.removeItem("current-song-name");
}
