import localforage from "localforage";
import type { Song } from "../domain/types";

localforage.config({
	driver: localforage.INDEXEDDB,
	name: "tocai-songs",
	storeName: "library",
});

export async function saveFile(name: string, data: Blob): Promise<void> {
	await localforage.setItem(name, data);
}

export async function getFile(name: string): Promise<Blob | null> {
	const data = await localforage.getItem<Blob>(name);
	return data;
}

export async function saveSong(name: string, song: Song): Promise<void> {
	await localforage.setItem(`song-${name}`, song);
}

export async function getSong(name: string): Promise<Song | null> {
	return await localforage.getItem<Song>(`song-${name}`);
}

export async function setCurrentSong(name: string): Promise<void> {
	localStorage.setItem("current-song-name", name);
}

export async function getCurrentSongName(): Promise<string | null> {
	return localStorage.getItem("current-song-name");
}

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

export async function deleteSong(name: string): Promise<void> {
	await localforage.removeItem(`song-${name}`);
	await localforage.removeItem(name); // Also remove the raw file if any
	const current = await getCurrentSongName();
	if (current === name) {
		localStorage.removeItem("current-song-name");
	}
}

export async function clearStorage(): Promise<void> {
	await localforage.clear();
	localStorage.removeItem("current-song-name");
}

export async function listFileNames(): Promise<string[]> {
	return await localforage.keys();
}

export async function deleteFile(name: string): Promise<void> {
	await localforage.removeItem(name);
}
