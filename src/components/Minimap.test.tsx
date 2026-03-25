import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { syncVisualState } from "../engine/visualSync";
import { Minimap } from "./Minimap";

let timelineTime = 0;

const mockMinimapRenderer = {
	setTrack: vi.fn(),
	draw: vi.fn(),
	getTimeFromX: vi.fn(() => 2.5),
};

vi.mock("tone", () => ({
	getTransport: () => ({
		seconds: 0,
	}),
}));

vi.mock("../hooks/useTransportStatus", () => ({
	useTransportStatus: () => "stopped",
}));

vi.mock("../engine/playbackTimeline", () => ({
	getPlaybackTimelineTime: vi.fn(() => timelineTime),
}));

vi.mock("../engine/MinimapRenderer", () => ({
	MinimapRenderer: vi.fn(function MockMinimapRenderer() {
		return mockMinimapRenderer;
	}),
}));

const createMockTrack = (): Track => ({
	id: "test-track",
	name: "Test Track",
	tuning: [82, 87, 92, 97, 101, 106],
	notes: [
		{
			pitch: 82,
			startTime: 0,
			duration: 1,
			string: 0,
			fret: 0,
			techniques: {},
		},
		{
			pitch: 87,
			startTime: 2,
			duration: 1,
			string: 1,
			fret: 0,
			techniques: {},
		},
	],
});

describe("Minimap", () => {
	const mockOnSeek = vi.fn();

	beforeEach(() => {
		timelineTime = 0;
		vi.clearAllMocks();
		mockOnSeek.mockClear();
		mockMinimapRenderer.getTimeFromX.mockReturnValue(2.5);
	});

	it("renders canvas element", () => {
		const track = createMockTrack();
		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).not.toBeNull();
	});

	it("canvas has correct height (48px)", () => {
		const track = createMockTrack();
		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas?.classList.contains("h-12")).toBe(true);
	});

	it("draws idle frames from the shared playback timeline", () => {
		timelineTime = 18.5;
		const track = createMockTrack();

		render(<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />);

		expect(mockMinimapRenderer.setTrack).toHaveBeenCalledWith(track, 5);
		expect(mockMinimapRenderer.draw).toHaveBeenCalledWith(18.5);
	});

	it("click on canvas calls onSeek callback", () => {
		const track = createMockTrack();
		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).not.toBeNull();
		if (!canvas) {
			throw new Error("Expected minimap canvas to render");
		}

		vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
			left: 0,
			top: 0,
			width: 800,
			height: 48,
			x: 0,
			y: 0,
			bottom: 48,
			right: 800,
			toJSON: () => ({}),
		} as DOMRect);

		fireEvent.pointerDown(canvas, { clientX: 400 });

		expect(mockMinimapRenderer.draw).toHaveBeenCalledWith(2.5);
		expect(mockOnSeek).toHaveBeenCalledWith(2.5);
	});

	it("redraws from the explicit visual sync channel without DOM lookups", () => {
		const track = createMockTrack();
		render(<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />);
		vi.clearAllMocks();

		syncVisualState(7.25);

		expect(mockMinimapRenderer.draw).toHaveBeenCalledWith(7.25);
	});
});
