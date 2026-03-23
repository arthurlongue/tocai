import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransportBar } from "./TransportBar";
import type { Track } from "../domain/types";

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

vi.mock("../hooks/useSpeedControl", () => ({
	useSpeedControl: () => ({
		speed: 1,
		setSpeed: vi.fn(),
		resetSpeed: vi.fn(),
	}),
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
				constructor() {}
				start() {}
				dispose() {}
			},
			Frequency: vi.fn((val: number, type: string) => ({
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
				currentTrack={mockTrack}
				onTrackChange={vi.fn()}
			/>,
		);

		const playButton = screen.getByRole("button", { name: /play/i });
		expect(playButton).toBeTruthy();
	});

	it("displays time format correctly", () => {
		render(
			<TransportBar
				songDuration={125}
				currentTrack={mockTrack}
				onTrackChange={vi.fn()}
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
				currentTrack={mockTrack}
				onTrackChange={vi.fn()}
			/>,
		);

		const pauseButton = screen.getByRole("button", { name: /pause/i });
		expect(pauseButton).toBeTruthy();
	});

	it("renders sliders for controls", () => {
		render(
			<TransportBar
				songDuration={300}
				currentTrack={mockTrack}
				onTrackChange={vi.fn()}
			/>,
		);

		const sliders = screen.getAllByRole("slider");
		expect(sliders.length).toBeGreaterThan(0);
	});

	it("renders with track info", () => {
		render(
			<TransportBar
				songDuration={240}
				currentTrack={mockTrack}
				onTrackChange={vi.fn()}
			/>,
		);

		const trackElements = screen.getAllByText("Guitar");
		expect(trackElements.length).toBeGreaterThan(0);
	});
});
