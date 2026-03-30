import localforage from "localforage";
import type { Song } from "../domain/types";

localforage.config({
	driver: localforage.INDEXEDDB,
	name: "tocai-songs",
	storeName: "library",
});

/**
 * Saves a raw Guitar Pro file blob to IndexedDB.
 *
 * @param name - Unique identifier for the file
 * @param data - The file blob to store
 */
export async function saveFile(name: string, data: Blob): Promise<void> {
	await localforage.setItem(name, data);
}

/**
 * Retrieves a raw Guitar Pro file blob from IndexedDB.
 *
 * @param name - The identifier of the file to retrieve
 * @returns The file blob, or null if not found
 */
export async function getFile(name: string): Promise<Blob | null> {
	const data = await localforage.getItem<Blob>(name);
	return data;
}

/**
 * Saves a parsed Song object to IndexedDB.
 *
 * @param name - Unique identifier for the song
 * @param song - The Song object to store
 */
export async function saveSong(name: string, song: Song): Promise<void> {
	await localforage.setItem(`song-${name}`, song);
}

/**
 * Retrieves a parsed Song object from IndexedDB.
 *
 * @param name - The identifier of the song to retrieve
 * @returns The Song object, or null if not found
 */
export async function getSong(name: string): Promise<Song | null> {
	return await localforage.getItem<Song>(`song-${name}`);
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
	const songKeys = keys.filter((key) => key.startsWith("song-"));
	const songs = await Promise.all(
		songKeys.map(async (key) => ({
			name: key.replace("song-", ""),
			song: (await localforage.getItem<Song>(key)) as Song,
		})),
	);
	return songs;
}

/**
 * Deletes a song and its associated raw file from storage.
 * Also clears the current song if it matches the deleted one.
 *
 * @param name - The name of the song to delete
 */
export async function deleteSong(name: string): Promise<void> {
	await localforage.removeItem(`song-${name}`);
	await localforage.removeItem(name); // Also remove the raw file if any
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

/**
 * Lists all raw file names stored in IndexedDB.
 *
 * @returns An array of all keys in the localforage store
 */
export async function listFileNames(): Promise<string[]> {
	return await localforage.keys();
}

/**
 * Deletes a raw file from IndexedDB.
 *
 * @param name - The name of the file to delete
 */
export async function deleteFile(name: string): Promise<void> {
	await localforage.removeItem(name);
}
