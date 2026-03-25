import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { MinimapRenderer } from "./MinimapRenderer";

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
	save: vi.fn(),
	restore: vi.fn(),
	drawImage: vi.fn(),
	fillText: vi.fn(),
	set fillStyle(_val: string) {},
	set strokeStyle(_val: string) {},
	set lineWidth(_val: number) {},
	set font(_val: string) {},
	set textAlign(_val: CanvasTextAlign) {},
};

describe("MinimapRenderer", () => {
	let canvas: HTMLCanvasElement;
	let renderer: MinimapRenderer;
	let layerCtx: typeof mockCtx;

	beforeEach(() => {
		canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 48;
		layerCtx = {
			...mockCtx,
			clearRect: vi.fn(),
			fillRect: vi.fn(),
			beginPath: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			stroke: vi.fn(),
			setTransform: vi.fn(),
			scale: vi.fn(),
			save: vi.fn(),
			restore: vi.fn(),
			drawImage: vi.fn(),
			fillText: vi.fn(),
		};
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
			function getContext() {
				return (this === canvas
					? mockCtx
					: layerCtx) as unknown as CanvasRenderingContext2D;
			},
		);
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

		it("clamps negative clicks to the song start", () => {
			const track = createMockTrack();
			renderer.setTrack(track);

			const time = renderer.getTimeFromX(-50);
			expect(time).toBe(0);
		});

		it("clamps overshooting clicks to the song end", () => {
			const track = createMockTrack();
			renderer.setTrack(track);

			const time = renderer.getTimeFromX(900);
			expect(time).toBeCloseTo(5, 1);
		});
	});

	it("reuses the cached static layer for later frames", () => {
		const track = createMockTrack();

		renderer.setTrack(track);
		expect(layerCtx.fillRect).toHaveBeenCalled();

		vi.clearAllMocks();

		renderer.draw(1);
		renderer.draw(2);

		expect(mockCtx.drawImage).toHaveBeenCalledTimes(2);
		expect(layerCtx.fillRect).not.toHaveBeenCalled();
	});
});
