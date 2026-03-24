import { describe, it, expect, beforeEach, vi } from "vitest";
import { MinimapRenderer } from "./MinimapRenderer";
import type { Track } from "../domain/types";

// Mock canvas context
const mockCtx = {
	clearRect: vi.fn(),
	fillRect: vi.fn(),
	beginPath: vi.fn(),
	moveTo: vi.fn(),
	lineTo: vi.fn(),
	stroke: vi.fn(),
	set fillStyle(_val: string) {},
	set strokeStyle(_val: string) {},
	set lineWidth(_val: number) {},
};

describe("MinimapRenderer", () => {
	let canvas: HTMLCanvasElement;
	let renderer: MinimapRenderer;

	beforeEach(() => {
		canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 48;
		vi.spyOn(canvas, "getContext").mockReturnValue(mockCtx as any);
		renderer = new MinimapRenderer(canvas);
	});

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
			{
				pitch: 92,
				startTime: 4,
				duration: 1,
				string: 2,
				fret: 0,
				techniques: {},
			},
		],
	});

	describe("getTimeFromX", () => {
		it("should return 0 when x is 0", () => {
			const track = createMockTrack();
			renderer.setTrack(track);

			const time = renderer.getTimeFromX(0);
			expect(time).toBe(0);
		});

		it("should return songDuration when x is canvas width", () => {
			const track = createMockTrack();
			renderer.setTrack(track);

			// Song duration is 5 seconds (last note starts at 4s + 1s duration)
			const time = renderer.getTimeFromX(800);
			expect(time).toBeCloseTo(5, 1);
		});

		it("should return songDuration/2 when x is canvas width/2", () => {
			const track = createMockTrack();
			renderer.setTrack(track);

			const time = renderer.getTimeFromX(400);
			expect(time).toBeCloseTo(2.5, 1);
		});
	});
});
