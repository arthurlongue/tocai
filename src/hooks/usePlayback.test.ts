import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayback } from "./usePlayback";

const mockTransport = {
	seconds: 4,
	start: vi.fn(),
	pause: vi.fn(),
};

const mockStopAll = vi.fn();
const mockGetPlaybackTimelineTime = vi.fn(() => 9.5);
const mockGetTransportSecondsForSongTime = vi.fn((seconds: number) => seconds);
const mockSyncPlaybackTimeline = vi.fn();
const mockSyncVisualState = vi.fn();

vi.mock("tone", () => ({
	start: vi.fn(() => Promise.resolve()),
	getTransport: () => mockTransport,
}));

vi.mock("../engine/AudioEngine", () => ({
	AudioEngine: {
		getInstance: () => ({
			stopAll: mockStopAll,
		}),
	},
}));

vi.mock("../engine/playbackTimeline", () => ({
	getTransportSecondsForSongTime: (...args: unknown[]) =>
		mockGetTransportSecondsForSongTime(...args),
	getPlaybackTimelineTime: (...args: unknown[]) =>
		mockGetPlaybackTimelineTime(...args),
	syncPlaybackTimeline: (...args: unknown[]) =>
		mockSyncPlaybackTimeline(...args),
}));

vi.mock("../engine/visualSync", () => ({
	syncVisualState: (...args: unknown[]) => mockSyncVisualState(...args),
}));

describe("usePlayback", () => {
	beforeEach(() => {
		mockTransport.seconds = 4;
		vi.clearAllMocks();
		mockGetPlaybackTimelineTime.mockReturnValue(9.5);
		mockGetTransportSecondsForSongTime.mockImplementation(
			(seconds: number) => seconds,
		);
	});

	it("publishes a visual sync after play", async () => {
		const { result } = renderHook(() => usePlayback());

		await act(async () => {
			await result.current.play();
		});

		expect(mockTransport.start).toHaveBeenCalledOnce();
		expect(mockSyncVisualState).toHaveBeenCalledWith(9.5);
	});

	it("publishes a visual sync after pause", () => {
		const { result } = renderHook(() => usePlayback());

		act(() => {
			result.current.pause();
		});

		expect(mockTransport.pause).toHaveBeenCalledOnce();
		expect(mockSyncVisualState).toHaveBeenCalledWith(9.5);
	});

	it("resets the playback timeline and visuals on stop", () => {
		const { result } = renderHook(() => usePlayback());

		act(() => {
			result.current.stop();
		});

		expect(mockStopAll).toHaveBeenCalledOnce();
		expect(mockSyncPlaybackTimeline).toHaveBeenCalledWith(0, 4);
		expect(mockSyncVisualState).toHaveBeenCalledWith(0);
	});

	it("maps song time onto transport time before seeking", async () => {
		const { result } = renderHook(() => usePlayback());
		mockGetTransportSecondsForSongTime.mockReturnValue(18.5);

		await act(async () => {
			await result.current.seek(12.25);
		});

		expect(mockGetTransportSecondsForSongTime).toHaveBeenCalledWith(12.25);
		expect(mockTransport.seconds).toBe(18.5);
		expect(mockSyncPlaybackTimeline).toHaveBeenCalledWith(12.25, 18.5);
		expect(mockSyncVisualState).toHaveBeenCalledWith(12.25);
	});

	it("clamps negative seeks to zero song time", async () => {
		const { result } = renderHook(() => usePlayback());
		mockGetTransportSecondsForSongTime.mockReturnValue(2);

		await act(async () => {
			await result.current.seek(-4);
		});

		expect(mockGetTransportSecondsForSongTime).toHaveBeenCalledWith(0);
		expect(mockTransport.seconds).toBe(2);
		expect(mockSyncPlaybackTimeline).toHaveBeenCalledWith(0, 2);
		expect(mockSyncVisualState).toHaveBeenCalledWith(0);
	});
});
