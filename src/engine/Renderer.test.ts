/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Renderer } from "./Renderer";

// Mock Tone.js
vi.mock("tone", () => ({
	getTransport: vi.fn(() => ({
		seconds: 0,
	})),
}));

describe("Renderer", () => {
	let canvas: HTMLCanvasElement;

	beforeEach(() => {
		// Basic canvas mock
		canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 600;

		// In JSDOM, getContext('2d') returns a basic mock if not configured.
		// We might need to mock some methods if they aren't available.
		const mockCtx = {
			clearRect: vi.fn(),
			beginPath: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			stroke: vi.fn(),
			fill: vi.fn(),
			arc: vi.fn(),
			fillText: vi.fn(),
			set strokeStyle(_val: any) {},
			set fillStyle(_val: any) {},
			set lineWidth(_val: any) {},
			set font(_val: any) {},
			set textAlign(_val: any) {},
			set textBaseline(_val: any) {},
		};

		if (!canvas.getContext("2d")) {
			canvas.getContext = vi.fn(() => mockCtx) as any;
		}
	});

	it("instantiates the Renderer class", () => {
		const renderer = new Renderer(canvas);
		expect(renderer).toBeDefined();
	});

	it("can start and stop the render loop", () => {
		const renderer = new Renderer(canvas);
		const startSpy = vi.spyOn(window, "requestAnimationFrame");
		const stopSpy = vi.spyOn(window, "cancelAnimationFrame");

		renderer.start();
		expect(startSpy).toHaveBeenCalled();

		renderer.stop();
		expect(stopSpy).toHaveBeenCalled();
	});

	it("can update the current track being rendered", () => {
		const renderer = new Renderer(canvas);
		const mockTrack = {
			id: "1",
			name: "Test",
			tuning: [],
			notes: [
				{
					pitch: 60,
					startTime: 0,
					duration: 1,
					string: 0,
					fret: 5,
					techniques: {},
				},
			],
		};
		renderer.setTrack(mockTrack as any);
		// No easy way to check private property, but it shouldn't throw
	});

	it("calls clearRect on each render", () => {
		const renderer = new Renderer(canvas);
		const ctx = canvas.getContext("2d")!;
		const clearRectSpy = vi.spyOn(ctx, "clearRect");

		renderer.render();

		expect(clearRectSpy).toHaveBeenCalled();
	});
});
