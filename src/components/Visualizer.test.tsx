import { render } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getPlaybackTimelineTime } from "../engine/playbackTimeline";
import { syncVisualState } from "../engine/visualSync";
import { Visualizer } from "./Visualizer";

let transportSeconds = 0;
let timelineSeconds = 0;

const mockRenderer = {
	setTrack: vi.fn(),
	setSpeed: vi.fn(),
	start: vi.fn(),
	stop: vi.fn(),
	draw: vi.fn(),
	drawAt: vi.fn(),
};

vi.mock("tone", () => ({
	getTransport: vi.fn(() => ({
		seconds: transportSeconds,
	})),
}));

vi.mock("../engine/playbackTimeline", () => ({
	getPlaybackTimelineTime: vi.fn(() => timelineSeconds),
}));

vi.mock("../hooks/useTransportStatus", () => ({
	useTransportStatus: () => "stopped",
}));

vi.mock("../engine/Renderer", () => ({
	Renderer: vi.fn(function MockRenderer() {
		return mockRenderer;
	}),
}));

describe("Visualizer", () => {
	beforeAll(() => {
		global.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	});

	beforeEach(() => {
		transportSeconds = 0;
		timelineSeconds = 0;
		vi.clearAllMocks();
	});

	it("keeps the sought transport position when rerendering while stopped", () => {
		transportSeconds = 12.5;
		timelineSeconds = 12.5;
		const { rerender } = render(<Visualizer speed={1} />);

		expect(mockRenderer.setSpeed).toHaveBeenCalledWith(1);
		expect(mockRenderer.stop).toHaveBeenCalled();
		expect(mockRenderer.drawAt).toHaveBeenCalledWith(12.5);

		transportSeconds = 24.25;
		timelineSeconds = 18.5;
		rerender(<Visualizer speed={0.75} />);

		expect(mockRenderer.setSpeed).toHaveBeenLastCalledWith(0.75);
		expect(getPlaybackTimelineTime).toHaveBeenLastCalledWith(24.25);
		expect(mockRenderer.drawAt).toHaveBeenLastCalledWith(18.5);
	});

	it("redraws from the explicit visual sync channel without querying the DOM", () => {
		render(<Visualizer speed={1} />);
		vi.clearAllMocks();

		syncVisualState(7.25);

		expect(mockRenderer.drawAt).toHaveBeenCalledWith(7.25);
	});
});
