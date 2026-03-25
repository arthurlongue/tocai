import type {
	TabBar,
	TabBeat,
	TabNote,
	TabSong,
	TabTrack,
} from "guitarpro-parser";
import { describe, expect, it } from "vitest";
import { flattenSong } from "./flattening";

describe("flattenSong", () => {
	const mockNote = (string: number, fret: number): TabNote =>
		({
			string,
			fret,
			palmMute: false,
			letRing: false,
			vibrato: 0,
			hammerOn: false,
			pullOff: false,
			tie: { destination: false },
			bend: null,
		}) as unknown as TabNote;

	const mockBeat = (notes: TabNote[], isRest = false): TabBeat =>
		({
			notes,
			duration: "quarter",
			tuplet: null,
			dotted: 0,
			isRest,
			tempo: 120, // 120 BPM -> 500ms per quarter beat
			index: 0,
			barIndex: 0,
			dynamic: "mf",
		}) as unknown as TabBeat;

	const mockBar = (
		beats: TabBeat[],
		repeatStart = false,
		repeatEnd = false,
		index = 0,
	): TabBar =>
		({
			index,
			timeSignature: { numerator: 4, denominator: 4 },
			beats,
			repeatStart,
			repeatEnd,
			keySignature: 0,
			section: null,
			repeatCount: repeatEnd ? 2 : 1,
		}) as unknown as TabBar;

	const mockTrack = (bars: TabBar[]): TabTrack =>
		({
			id: "1",
			name: "Guitar",
			tuning: [],
			tuningMidi: [64, 59, 55, 50, 45, 40], // Standard E
			capoFret: 0,
			bars,
			shortName: "Gtr",
			instrument: { id: 25 },
		}) as unknown as TabTrack;

	const mockSong = (tracks: TabTrack[]): TabSong =>
		({
			title: "Test Song",
			artist: "Test Artist",
			album: "Test Album",
			tracks,
		}) as unknown as TabSong;

	it("should flatten a simple track into notes with absolute timing", () => {
		const beat1 = mockBeat([mockNote(0, 5)]); // string 0, fret 5
		const beat2 = mockBeat([mockNote(1, 7)]); // string 1, fret 7
		const bar = mockBar([beat1, beat2]);
		const track = mockTrack([bar]);
		const song = mockSong([track]);

		const flattened = flattenSong(song);

		expect(flattened.tracks[0].notes).toHaveLength(2);
		expect(flattened.tracks[0].notes[0].startTime).toBe(0);
		expect(flattened.tracks[0].notes[0].duration).toBe(0.5);
		expect(flattened.tracks[0].notes[1].startTime).toBe(0.5);
	});

	it("should calculate correct MIDI pitch including tuning and capo", () => {
		const track = mockTrack([mockBar([mockBeat([mockNote(0, 5)])])]);
		track.tuningMidi = [64]; // E4
		track.capoFret = 2;
		// E4 + 5 frets + 2 capo = 64 + 5 + 2 = 71 (B4)

		const flattened = flattenSong(mockSong([track]));
		expect(flattened.tracks[0].notes[0].pitch).toBe(71);
	});

	it("should merge tied notes into a single long note", () => {
		const note1 = mockNote(0, 5);
		const note2 = mockNote(0, 5);
		note2.tie.destination = true;

		const bar = mockBar([mockBeat([note1]), mockBeat([note2])]);
		const flattened = flattenSong(mockSong([mockTrack([bar])]));

		expect(flattened.tracks[0].notes).toHaveLength(1);
		expect(flattened.tracks[0].notes[0].duration).toBe(1.0); // 0.5 + 0.5
	});

	it('should expand repeats "as heard"', () => {
		// Bar 1 (Repeat Start) | Bar 2 (Repeat End)
		const beat1 = mockBeat([mockNote(0, 1)]);
		const beat2 = mockBeat([mockNote(0, 2)]);

		const bar1 = mockBar([beat1], true, false, 0);
		const bar2 = mockBar([beat2], false, true, 1);

		const flattened = flattenSong(mockSong([mockTrack([bar1, bar2])]));

		// Expected sequence: Bar 1, Bar 2, Bar 1, Bar 2
		expect(flattened.tracks[0].notes).toHaveLength(4);
		expect(flattened.tracks[0].notes[0].fret).toBe(1);
		expect(flattened.tracks[0].notes[1].fret).toBe(2);
		expect(flattened.tracks[0].notes[2].fret).toBe(1);
		expect(flattened.tracks[0].notes[3].fret).toBe(2);

		expect(flattened.measures).toHaveLength(4);
	});
});
