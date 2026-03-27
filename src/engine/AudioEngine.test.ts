import * as Tone from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { AudioEngine } from "./AudioEngine";

// ---------------------------------------------------------------------------
// Tone.js mock
// vi.mock is hoisted, so all variables referenced inside the factory must
// either be defined inside the factory or use vi.hoisted().
// ---------------------------------------------------------------------------

const { mockTransport } = vi.hoisted(() => ({
	mockTransport: { stop: vi.fn(), bpm: { value: 120 } },
}));

vi.mock("tone", () => {
	return {
		Frequency: vi.fn(() => ({ toFrequency: () => 440 })),
		getContext: vi.fn(() => ({ state: "suspended" })),
		getTransport: vi.fn(() => mockTransport),
		start: vi.fn(),
		gainToDb: vi.fn((gain: number) =>
			gain === 0 ? -Infinity : 20 * Math.log10(gain),
		),
		// Use function syntax so `new Synth()` etc work correctly as constructors
		Synth: vi.fn().mockImplementation(function (this: any) {
			this.triggerAttackRelease = vi.fn();
			this.toDestination = vi.fn().mockReturnThis();
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
			this.triggerRelease = vi.fn();
			this.frequency = { rampTo: vi.fn() };
			this.detune = { rampTo: vi.fn(), setValueAtTime: vi.fn() };
		}),
		Volume: vi.fn().mockImplementation(function (this: any) {
			this.volume = { value: 0 };
			this.toDestination = vi.fn().mockReturnThis();
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
		}),
		getDestination: vi.fn(),
		Draw: { schedule: vi.fn() },
		Part: vi.fn().mockImplementation(function (this: any) {
			this.start = vi.fn();
			this.dispose = vi.fn();
		}),
	};
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTrack = (id: string, name: string, noteCount = 2): Track => ({
	id,
	name,
	tuning: [40, 45, 50, 55, 59, 64],
	notes: Array.from({ length: noteCount }, (_, i) => ({
		trackId: id,
		pitch: 60 + i,
		startTime: i * 0.5,
		duration: 0.4,
		string: i % 6,
		fret: i,
		techniques: {},
	})),
});

// ---------------------------------------------------------------------------
// Reset singleton between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
	vi.clearAllMocks();
	// biome-ignore lint/suspicious/noExplicitAny: test-only singleton reset
	(AudioEngine as any).instance = undefined;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AudioEngine – singleton", () => {
	it("returns the same instance on repeated calls", () => {
		const a = AudioEngine.getInstance();
		const b = AudioEngine.getInstance();
		expect(a).toBe(b);
	});
});

describe("AudioEngine – multi-track loading", () => {
	it("creates one Tone.Part per track", () => {
		const engine = AudioEngine.getInstance();
		const tracks = [makeTrack("t1", "Guitar"), makeTrack("t2", "Bass")];
		engine.loadSong(tracks);
		expect(vi.mocked(Tone.Part)).toHaveBeenCalledTimes(2);
	});

	it("starts each Part at 0", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		const partInstance = vi.mocked(Tone.Part).mock.results[0].value;
		expect(partInstance.start).toHaveBeenCalledWith(0);
	});

	it("disposes previous parts when loadSong is called again", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		const firstPart = vi.mocked(Tone.Part).mock.results[0].value;
		engine.loadSong([makeTrack("t2", "Bass")]);
		expect(firstPart.dispose).toHaveBeenCalled();
	});
});

describe("AudioEngine – per-track volume", () => {
	it("setTrackVolume adjusts the track Volume node via gainToDb", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		vi.clearAllMocks();
		engine.setTrackVolume("t1", 0.5);
		expect(Tone.gainToDb).toHaveBeenCalledWith(0.5);
	});

	it("does nothing when trackId is unknown", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		expect(() => engine.setTrackVolume("unknown", 0.5)).not.toThrow();
	});
});

describe("AudioEngine – mute", () => {
	it("setTrackMute(true) calls gainToDb(0) to silence the track", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		vi.clearAllMocks();
		engine.setTrackMute("t1", true);
		expect(Tone.gainToDb).toHaveBeenCalledWith(0);
	});

	it("setTrackMute(false) calls gainToDb again to restore volume", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		engine.setTrackVolume("t1", 0.7);
		engine.setTrackMute("t1", true);
		const callsBefore = vi.mocked(Tone.gainToDb).mock.calls.length;
		engine.setTrackMute("t1", false);
		expect(vi.mocked(Tone.gainToDb).mock.calls.length).toBeGreaterThan(
			callsBefore,
		);
	});
});

describe("AudioEngine – solo", () => {
	it("setSolo mutes all non-solo tracks via gainToDb(0)", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([
			makeTrack("t1", "Guitar"),
			makeTrack("t2", "Bass"),
			makeTrack("t3", "Drums"),
		]);
		vi.clearAllMocks();
		engine.setSolo("t1");
		const calls = vi.mocked(Tone.gainToDb).mock.calls;
		expect(calls.filter(([g]) => g === 0).length).toBeGreaterThanOrEqual(2);
	});

	it("setSolo(null) calls gainToDb for every track to restore volumes", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar"), makeTrack("t2", "Bass")]);
		engine.setSolo("t1");
		vi.clearAllMocks();
		engine.setSolo(null);
		expect(vi.mocked(Tone.gainToDb).mock.calls.length).toBeGreaterThanOrEqual(
			2,
		);
	});
});

describe("AudioEngine – stopAll", () => {
	it("stops the transport via Tone.getTransport().stop()", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar"), makeTrack("t2", "Bass")]);
		engine.stopAll();
		expect(mockTransport.stop).toHaveBeenCalled();
	});
});

describe("AudioEngine – reset", () => {
	it("resets transport.seconds to 0", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		// Simulate playback position
		Tone.getTransport().seconds = 42;
		engine.reset();
		expect(Tone.getTransport().seconds).toBe(0);
	});

	it("resets transport.bpm.value to baseBpm (120)", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		Tone.getTransport().bpm.value = 200;
		engine.reset();
		expect(Tone.getTransport().bpm.value).toBe(120);
	});
});

describe("AudioEngine – triggerNote (regression)", () => {
	it("triggers a note on the correct string of the correct track", () => {
		const engine = AudioEngine.getInstance();
		const track = makeTrack("t1", "Guitar");
		engine.loadSong([track]);

		const stringSynth = engine.getStringSynth("t1");
		expect(stringSynth).toBeDefined();
		const triggerSpy = vi.spyOn(stringSynth!, "triggerAttackRelease");

		engine.triggerNote(
			{
				trackId: "t1",
				pitch: 60,
				startTime: 0,
				duration: 1,
				string: 2,
				fret: 5,
				techniques: {},
			},
			0,
		);

		expect(Tone.Frequency).toHaveBeenCalledWith(60, "midi");
		expect(triggerSpy).toHaveBeenCalledWith(2, 440, 1, 0);
	});
});

describe("AudioEngine – techniques (slides and bends)", () => {
	it("schedules a detune ramp for bends", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		const synth = engine.getStringSynth("t1");
		const detuneRampSpy = vi.spyOn(synth!, "detuneRamp");

		engine.triggerNote(
			{
				trackId: "t1",
				pitch: 60,
				startTime: 0,
				duration: 1,
				string: 0,
				fret: 0,
				techniques: { bend: { type: "normal", value: 2 } }, // Whole bend
			},
			0,
		);

		expect(detuneRampSpy).toHaveBeenCalledWith(0, 2, 0.5, 0);
	});

	it("schedules a frequency ramp for slides", () => {
		const engine = AudioEngine.getInstance();
		engine.loadSong([makeTrack("t1", "Guitar")]);
		const synth = engine.getStringSynth("t1");
		const frequencyRampSpy = vi.spyOn(synth!, "frequencyRamp");

		engine.triggerNote(
			{
				trackId: "t1",
				pitch: 60,
				startTime: 0,
				duration: 1,
				string: 0,
				fret: 5,
				techniques: { slide: { type: "up" } },
			},
			0,
		);

		// Slide up by 2 semitones = pitch 60 -> 62
		expect(Tone.Frequency).toHaveBeenCalledWith(62, "midi");
		expect(frequencyRampSpy).toHaveBeenCalledWith(
			0,
			440, // Mocked Frequency returns 440
			0.8,
			0.2,
		);
	});
});
