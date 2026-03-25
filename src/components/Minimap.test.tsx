import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { Minimap } from "./Minimap";

// Mock Tone.js
vi.mock("tone", () => ({
	getTransport: () => ({
		seconds: 0,
	}),
}));

// Mock canvas context
const mockCtx = {
	clearRect: vi.fn(),
	fillRect: vi.fn(),
	beginPath: vi.fn(),
	moveTo: vi.fn(),
	lineTo: vi.fn(),
	stroke: vi.fn(),
	setTransform: vi.fn(),
	scale: vi.fn(),
	fillText: vi.fn(),
	set fillStyle(_val: string) {},
	set strokeStyle(_val: string) {},
	set lineWidth(_val: number) {},
};

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
		vi.clearAllMocks();
		mockOnSeek.mockClear();
	});

	it("renders canvas element", () => {
		const track = createMockTrack();
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
			mockCtx as any,
		);

		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).not.toBeNull();
	});

	it("canvas has correct height (48px)", () => {
		const track = createMockTrack();
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
			mockCtx as any,
		);

		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas?.classList.contains("h-12")).toBe(true);
	});

	it("click on canvas calls onSeek callback", () => {
		const track = createMockTrack();
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
			mockCtx as any,
		);

		const { container } = render(
			<Minimap track={track} songDuration={5} onSeek={mockOnSeek} />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).not.toBeNull();

		// Mock getBoundingClientRect for the canvas
		vi.spyOn(canvas!, "getBoundingClientRect").mockReturnValue({
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

		// Simulate pointer down at middle of canvas (400px)
		// The component uses onPointerDown, not onClick
		fireEvent.pointerDown(canvas!, { clientX: 400 });

		expect(mockOnSeek).toHaveBeenCalledWith(expect.any(Number));
	});
});
