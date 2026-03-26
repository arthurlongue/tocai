/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Manual mock of localforage since the real one doesn't play nice with fake-indexeddb in this env
const mockStore = new Map<string, unknown>();

const cloneStoredValue = async <T>(value: T): Promise<T> => {
	if (value instanceof Blob) {
		return value.slice(0, value.size, value.type) as T;
	}
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value)) as T;
};

vi.mock("localforage", () => ({
	default: {
		config: vi.fn(),
		setItem: vi.fn(async (key, value) => {
			const storedValue = await cloneStoredValue(value);
			mockStore.set(key, storedValue);
			return storedValue;
		}),
		getItem: vi.fn(async (key) => {
			const value = mockStore.get(key);
			if (value === undefined) {
				return null;
			}
			return await cloneStoredValue(value);
		}),
		removeItem: vi.fn((key) => {
			mockStore.delete(key);
			return Promise.resolve();
		}),
		clear: vi.fn(() => {
			mockStore.clear();
			return Promise.resolve();
		}),
		keys: vi.fn(() => Promise.resolve(Array.from(mockStore.keys()))),
		INDEXEDDB: "asyncStorage",
	},
}));

import type { Song } from "../domain/types";
import {
	clearStorage,
	deleteFile,
	deleteSong,
	getCurrentSongName,
	getFile,
	getSong,
	listFileNames,
	listSongs,
	saveFile,
	saveSong,
	setCurrentSong,
} from "./storage";

/** Creates a Song fixture with populated nested playback structures to exercise serialization. */
function createTestSong(overrides: Partial<Song> = {}): Song {
	return {
		metadata: {
			title: "Test Song",
			artist: "Test Artist",
			album: "Test Album",
		},
		tracks: [
			{
				id: "track-1",
				name: "Guitar",
				tuning: [64, 59, 55, 50, 45, 40],
				notes: [
					{
						trackId: "track-1",
						pitch: 40,
						startTime: 0,
						duration: 0.5,
						string: 5,
						fret: 0,
						techniques: {
							isPalmMute: false,
							isLetRing: false,
							isStaccato: false,
							slide: { type: "none" },
							bend: undefined,
							vibrato: false,
							hammerOn: false,
							pullOff: false,
						},
					},
					{
						trackId: "track-1",
						pitch: 45,
						startTime: 0.5,
						duration: 0.5,
						string: 5,
						fret: 0,
						techniques: {
							isPalmMute: false,
							isLetRing: false,
							isStaccato: false,
							slide: { type: "none" },
							bend: undefined,
							vibrato: false,
							hammerOn: false,
							pullOff: false,
						},
					},
				],
			},
		],
		measures: [
			{
				index: 0,
				startTime: 0,
				duration: 4,
				timeSignature: { numerator: 4, denominator: 4 },
			},
		],
		durationSeconds: 180,
		...overrides,
	};
}

describe("Library Storage Service", () => {
	const testFileName = "test-song.gp5";
	const testFileData = new Blob(["dummy content"], {
		type: "application/octet-stream",
	});

	beforeEach(async () => {
		await clearStorage();
	});

	it("should save and retrieve a file", async () => {
		await saveFile(testFileName, testFileData);
		const retrieved = await getFile(testFileName);

		expect(retrieved).not.toBeNull();
		expect(retrieved?.size).toBe(testFileData.size);
		expect(retrieved?.type).toBe(testFileData.type);

		const text = await retrieved?.text();
		expect(text).toBe("dummy content");
	});

	it("should return null for non-existent file", async () => {
		const retrieved = await getFile("not-found.gp5");
		expect(retrieved).toBeNull();
	});

	it("should list all stored file names", async () => {
		await saveFile("song1.gp5", testFileData);
		await saveFile("song2.gp5", testFileData);

		const list = await listFileNames();
		expect(list).toContain("song1.gp5");
		expect(list).toContain("song2.gp5");
		expect(list.length).toBe(2);
	});

	it("should delete a file", async () => {
		await saveFile(testFileName, testFileData);
		await deleteFile(testFileName);

		const retrieved = await getFile(testFileName);
		expect(retrieved).toBeNull();

		const list = await listFileNames();
		expect(list).not.toContain(testFileName);
	});

	it("should save and retrieve a parsed song", async () => {
		const testSong = createTestSong({
			metadata: { title: "Test Title", artist: "Test Artist", album: "" },
			durationSeconds: 120,
		});
		await saveSong("test-song", testSong);
		const retrieved = await getSong("test-song");
		expect(retrieved).toEqual(testSong);
		expect(retrieved).not.toBe(testSong);
		expect(retrieved?.tracks).not.toBe(testSong.tracks);
		expect(retrieved?.tracks[0]?.notes).not.toBe(testSong.tracks[0]?.notes);
		expect(retrieved?.tracks[0]?.notes[0]?.techniques).not.toBe(
			testSong.tracks[0]?.notes[0]?.techniques,
		);
	});

	it("should track the current song name", async () => {
		await setCurrentSong("current-test");
		const current = await getCurrentSongName();
		expect(current).toBe("current-test");
	});

	it("should list all saved songs with their data", async () => {
		const song1 = createTestSong({
			metadata: { title: "Song 1", artist: "Artist 1", album: "Album 1" },
		});
		const song2 = createTestSong({
			metadata: { title: "Song 2", artist: "Artist 2", album: "Album 2" },
		});
		await saveSong("s1", song1);
		await saveSong("s2", song2);
		const list = await listSongs();
		expect(list).toHaveLength(2);
		expect(list.find((s) => s.name === "s1")?.song.metadata.title).toBe(
			"Song 1",
		);
		expect(list.find((s) => s.name === "s2")?.song.metadata.title).toBe(
			"Song 2",
		);
	});

	it("should delete a song and clear current reference if matching", async () => {
		await saveSong(
			"delete-me",
			createTestSong({ metadata: { title: "X", artist: "Y", album: "Z" } }),
		);
		await setCurrentSong("delete-me");
		await deleteSong("delete-me");
		const retrieved = await getSong("delete-me");
		expect(retrieved).toBeNull();
		const current = await getCurrentSongName();
		expect(current).toBeNull();
	});
});
