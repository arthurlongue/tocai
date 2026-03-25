import { act, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { getPlaybackTimelineTime } from "../engine/playbackTimeline";
import { syncVisualState } from "../engine/visualSync";
import { TransportBar } from "./TransportBar";

// Mock ResizeObserver
beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
});

// Track transport status for mocking
let mockTransportStatus = "stopped";

// Mock the hooks
vi.mock("../hooks/usePlayback", () => ({
	usePlayback: () => ({
		play: vi.fn(),
		pause: vi.fn(),
		stop: vi.fn(),
		seek: vi.fn(),
	}),
}));

vi.mock("../hooks/useTransportStatus", async () => {
	const actual = await vi.importActual("../hooks/useTransportStatus");
	return {
		...actual,
		useTransportStatus: () => mockTransportStatus,
	};
});

vi.mock("../engine/playbackTimeline", () => ({
	getPlaybackTimelineTime: vi.fn(() => 0),
}));

// Mock Tone.js
vi.mock("tone", async () => {
	const actual = await vi.importActual("tone");
	return {
		...actual,
		default: {
			...actual,
			getTransport: vi.fn(() => ({
				seconds: 0,
				bpm: { value: 120 },
				state: "stopped",
				on: vi.fn(),
				off: vi.fn(),
			})),
			getDestination: vi.fn(() => ({
				volume: { value: 0 },
			})),
			gainToDb: vi.fn((gain) => 20 * Math.log10(gain)),
			getContext: vi.fn(() => ({
				state: "running",
			})),
			start: vi.fn(),
			Draw: {
				schedule: vi.fn(),
			},
			Part: class Part {
				start() {}
				dispose() {}
			},
			Frequency: vi.fn((_val: number, _type: string) => ({
				toFrequency: () => 440,
			})),
		},
	};
});

const mockTrack: Track = {
	name: "Guitar",
	instrument: "guitar",
	tuning: [82, 87, 92, 97, 101, 106],
	notes: [],
};

describe("TransportBar", () => {
	beforeEach(() => {
		mockTransportStatus = "stopped";
		vi.clearAllMocks();
	});

	it("renders PLAY button when stopped", () => {
		render(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		const playButton = screen.getByRole("button", { name: /play/i });
		expect(playButton).toBeTruthy();
	});

	it("displays time format correctly", () => {
		render(
			<TransportBar
				songDuration={125}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		// Should show "2:05" for 125 seconds
		const timeElements = screen.getAllByText(/2:05/);
		expect(timeElements.length).toBeGreaterThan(0);
	});

	it("shows PAUSE button when playing", () => {
		mockTransportStatus = "started";

		render(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		const pauseButton = screen.getByRole("button", { name: /pause/i });
		expect(pauseButton).toBeTruthy();
	});

	it("renders sliders for controls", () => {
		render(
			<TransportBar
				songDuration={300}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		const sliders = screen.getAllByRole("slider");
		expect(sliders.length).toBeGreaterThan(0);
	});

	it("renders with track info", () => {
		render(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		const trackElements = screen.getAllByText("Guitar");
		expect(trackElements.length).toBeGreaterThan(0);
	});

	it("polls playback time only while started", () => {
		vi.useFakeTimers();
		const playbackTime = vi.mocked(getPlaybackTimelineTime);
		const { rerender, unmount } = render(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		expect(playbackTime).toHaveBeenCalledTimes(1);

		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(playbackTime).toHaveBeenCalledTimes(1);

		mockTransportStatus = "started";
		rerender(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(playbackTime.mock.calls.length).toBeGreaterThan(1);

		unmount();
		vi.useRealTimers();
	});

	it("updates the displayed time from playback sync events while idle", () => {
		render(
			<TransportBar
				songDuration={240}
				speed={1}
				onSpeedChange={vi.fn()}
				currentTrack={mockTrack}
			/>,
		);

		act(() => {
			syncVisualState(12.5);
		});

		expect(screen.getAllByText(/0:12/).length).toBeGreaterThan(0);
	});
});
