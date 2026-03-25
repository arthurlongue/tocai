import * as Tone from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioEngine } from "./AudioEngine";

// Mock Tone.js - use class syntax to ensure constructor works
class MockSynth {
	triggerAttackRelease = vi.fn();
	toDestination = vi.fn().mockReturnThis();
	dispose = vi.fn();
	triggerRelease = vi.fn();
}

vi.mock("tone", () => {
	return {
		Frequency: vi.fn(() => ({ toFrequency: () => 440 })),
		getContext: vi.fn(() => ({
			state: "suspended",
		})),
		start: vi.fn(),
		Synth: class MockSynth {
			triggerAttackRelease = vi.fn();
			toDestination = vi.fn().mockReturnThis();
			dispose = vi.fn();
			triggerRelease = vi.fn();
		},
		getDestination: vi.fn(),
	};
});

describe("AudioEngine", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should be a singleton", () => {
		const instance1 = AudioEngine.getInstance();
		const instance2 = AudioEngine.getInstance();
		expect(instance1).toBe(instance2);
	});

	it("should trigger a note on the correct string", () => {
		const engine = AudioEngine.getInstance();
		const playbackNote = {
			pitch: 60,
			startTime: 0,
			duration: 1,
			string: 2,
			fret: 5,
			techniques: {},
		};

		// We need to access private stringSynth to check its synths or mock its methods
		const stringSynth = engine.getStringSynth();
		const triggerSpy = vi.spyOn(stringSynth, "triggerAttackRelease");

		engine.triggerNote(playbackNote, 0);

		expect(Tone.Frequency).toHaveBeenCalledWith(60, "midi");
		expect(triggerSpy).toHaveBeenCalledWith(
			2, // string index
			440, // mock frequency
			1, // duration
			0, // time
		);
	});

	it("should start the audio context if suspended", async () => {
		const engine = AudioEngine.getInstance();
		await engine.start();
		expect(Tone.start).toHaveBeenCalled();
	});
});
