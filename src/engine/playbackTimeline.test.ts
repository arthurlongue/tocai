import * as Tone from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getPlaybackTimelineTime,
	getTransportSecondsForSongTime,
	resetPlaybackTimelineState,
	setPlaybackTimelineSpeed,
	syncPlaybackTimeline,
} from "./playbackTimeline";

let transportSeconds = 0;

vi.mock("tone", () => ({
	getTransport: vi.fn(() => ({
		seconds: transportSeconds,
	})),
}));

describe("playbackTimeline", () => {
	beforeEach(() => {
		transportSeconds = 0;
		resetPlaybackTimelineState();
		vi.clearAllMocks();
	});

	it("keeps song time continuous when playback speed changes", () => {
		transportSeconds = 2;
		expect(getPlaybackTimelineTime()).toBe(2);

		setPlaybackTimelineSpeed(0.5);
		expect(getPlaybackTimelineTime()).toBe(2);

		transportSeconds = 4;
		expect(getPlaybackTimelineTime()).toBe(3);
		expect(Tone.getTransport).toHaveBeenCalled();
	});

	it("reanchors song time after seek while preserving the current speed", () => {
		transportSeconds = 6;
		setPlaybackTimelineSpeed(1.5);
		syncPlaybackTimeline(12);

		expect(getPlaybackTimelineTime()).toBe(12);

		transportSeconds = 8;
		expect(getPlaybackTimelineTime()).toBe(15);
	});

	it("derives raw transport seconds for a target song time at the current speed", () => {
		transportSeconds = 6;
		setPlaybackTimelineSpeed(1.5);
		syncPlaybackTimeline(12);

		expect(getTransportSecondsForSongTime(18)).toBe(10);
		expect(getTransportSecondsForSongTime(-3)).toBe(0);
	});
});
