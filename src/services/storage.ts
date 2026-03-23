import localforage from "localforage";

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

export async function listFileNames(): Promise<string[]> {
	return await localforage.keys();
}

export async function deleteFile(name: string): Promise<void> {
	await localforage.removeItem(name);
}

export async function clearStorage(): Promise<void> {
	await localforage.clear();
}
