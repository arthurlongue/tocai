import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioEngine } from "../engine/AudioEngine";
import { setPlaybackTimelineSpeed } from "../engine/playbackTimeline";
import { useSpeedControl } from "./useSpeedControl";

// Mock AudioEngine
vi.mock("../engine/AudioEngine", () => ({
	AudioEngine: {
		getInstance: vi.fn(),
	},
}));

vi.mock("../engine/playbackTimeline", () => ({
	setPlaybackTimelineSpeed: vi.fn(),
}));

// Mock Tone.js
vi.mock("tone", () => ({
	default: {
		getTransport: () => ({
			bpm: { value: 120 },
		}),
		getDestination: () => ({
			volume: { value: 0 },
		}),
		gainToDb: vi.fn((gain) => 20 * Math.log10(gain)),
	},
}));

describe("useSpeedControl", () => {
	let mockEngine: { setSpeed: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockEngine = {
			setSpeed: vi.fn(),
		};
		vi.mocked(setPlaybackTimelineSpeed).mockClear();
		vi.mocked(AudioEngine.getInstance).mockReturnValue(
			mockEngine as unknown as AudioEngine,
		);
	});

	it("initial speed is 1.0", () => {
		const { result } = renderHook(() => useSpeedControl());
		expect(result.current.speed).toBe(1);
	});

	it("setSpeed(1.5) sets speed to 1.5", () => {
		const { result } = renderHook(() => useSpeedControl());

		act(() => {
			result.current.setSpeed(1.5);
		});

		expect(result.current.speed).toBe(1.5);
		expect(mockEngine.setSpeed).toHaveBeenCalledWith(1.5);
		expect(setPlaybackTimelineSpeed).toHaveBeenCalledWith(1.5);
	});

	it("setSpeed clamps to 0.25 minimum", () => {
		const { result } = renderHook(() => useSpeedControl());

		act(() => {
			result.current.setSpeed(0.1);
		});

		expect(result.current.speed).toBe(0.25);
		expect(mockEngine.setSpeed).toHaveBeenCalledWith(0.25);
		expect(setPlaybackTimelineSpeed).toHaveBeenCalledWith(0.25);
	});

	it("setSpeed clamps to 2.0 maximum", () => {
		const { result } = renderHook(() => useSpeedControl());

		act(() => {
			result.current.setSpeed(3.0);
		});

		expect(result.current.speed).toBe(2);
		expect(mockEngine.setSpeed).toHaveBeenCalledWith(2);
		expect(setPlaybackTimelineSpeed).toHaveBeenCalledWith(2);
	});

	it("resetSpeed returns to 1.0", () => {
		const { result } = renderHook(() => useSpeedControl());

		act(() => {
			result.current.setSpeed(1.5);
			result.current.resetSpeed();
		});

		expect(result.current.speed).toBe(1);
		expect(mockEngine.setSpeed).toHaveBeenCalledWith(1);
		expect(setPlaybackTimelineSpeed).toHaveBeenCalledWith(1);
	});
});
