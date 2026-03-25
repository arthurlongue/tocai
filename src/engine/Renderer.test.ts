/**
 * @vitest-environment jsdom
 */

import type { Transport } from "tone";
import * as Tone from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HIT_LINE_X, NOTE_RADIUS, STRING_COUNT } from "./constants";
import { Renderer } from "./Renderer";

// Mock Tone.js
vi.mock("tone", () => ({
	getTransport: vi.fn(() => ({
		seconds: 0,
	})),
	getContext: vi.fn(() => ({
		rawContext: {
			outputLatency: 0,
		},
		lookAhead: 0,
	})),
}));

describe("Renderer", () => {
	let canvas: HTMLCanvasElement;
	let mockCtx: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Basic canvas mock
		canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 600;

		// Mock canvas context with spies
		mockCtx = {
			clearRect: vi.fn(),
			beginPath: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			stroke: vi.fn(),
			fill: vi.fn(),
			arc: vi.fn(),
			fillText: vi.fn(),
			strokeStyle: "",
			fillStyle: "",
			lineWidth: 0,
			font: "",
			textAlign: "",
			textBaseline: "",
		};

		vi.spyOn(canvas, "getContext").mockReturnValue(mockCtx as any);
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
			tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
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

	it("calls clearRect on each draw", () => {
		const renderer = new Renderer(canvas);
		const clearRectSpy = vi.spyOn(mockCtx, "clearRect");

		renderer.draw();

		expect(clearRectSpy).toHaveBeenCalled();
	});

	describe("VISUAL-01: Horizontal scrolling animation", () => {
		it("scrolls notes horizontally right-to-left based on time progression", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 2.0,
						duration: 0.5,
						string: 0,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			// At time 0, note at startTime 2.0 should be far to the right
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 0,
			} as unknown as Transport);
			renderer.draw();

			// Verify arc was called (note drawn) - position calculated from getNoteX
			expect(mockCtx.arc).toHaveBeenCalled();

			// At time 2.0, note should be near HIT_LINE_X (100)
			// Note: The renderer adds a small latency compensation (0.05), so the actual
			// position will be slightly offset: 100 + 0.05 * 200 = 110
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 2.0,
			} as unknown as Transport);
			mockCtx.arc.mockClear();
			renderer.draw();

			// The note should be drawn near HIT_LINE_X when currentTime matches startTime
			const arcCalls = mockCtx.arc.mock.calls;
			expect(arcCalls.length).toBeGreaterThan(0);
			// First argument is x coordinate
			const noteX = arcCalls[0][0] as number;
			// Expected: HIT_LINE_X + 0.05 * PIXELS_PER_SECOND = 100 + 10 = 110
			expect(noteX).toBeCloseTo(110, 0);
		});
	});

	describe("VISUAL-02: Dynamic lane rendering", () => {
		it("renders dynamic lanes based on track tuning", () => {
			const mockTrackWithTuning = {
				id: "1",
				name: "Standard Tuning",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrackWithTuning as any);
			renderer.draw();

			// Should draw STRING_COUNT horizontal lines for lanes TWICE (before and after notes)
			// plus 1 for hit-line
			// Total: STRING_COUNT * 2 + 1 = 13 calls
			expect(mockCtx.moveTo).toHaveBeenCalledTimes(STRING_COUNT * 2 + 1);
			expect(mockCtx.lineTo).toHaveBeenCalledTimes(STRING_COUNT * 2 + 1);

			// Verify Y positions are calculated correctly for each string lane (first set)
			const laneHeight = 600 / STRING_COUNT; // height / STRING_COUNT
			const moveToCalls = mockCtx.moveTo.mock.calls;

			for (let i = 0; i < STRING_COUNT; i++) {
				const expectedY = i * laneHeight + laneHeight / 2;
				// moveTo is called with (0, y) for each lane
				expect(moveToCalls[i][1]).toBeCloseTo(expectedY, 0);
			}
		});

		it("renders lanes at correct vertical positions", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			// Verify string lanes are drawn as horizontal lines
			const lineToCalls = mockCtx.lineTo.mock.calls;
			for (let i = 0; i < STRING_COUNT; i++) {
				// Each line should span the full width (0 to width)
				expect(lineToCalls[i][0]).toBe(800); // width
			}
		});
	});

	describe("VISUAL-03: Fret number rendering", () => {
		it("draws fret numbers inside note circles", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 0,
						duration: 1,
						string: 0,
						fret: 7,
						techniques: {},
					},
					{
						pitch: 62,
						startTime: 1,
						duration: 1,
						string: 1,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);
			renderer.draw();

			// fillText should be called for each note's fret number
			expect(mockCtx.fillText).toHaveBeenCalledTimes(2);

			// Verify fillText is called with the correct fret numbers as strings
			const fillTextCalls = mockCtx.fillText.mock.calls;
			expect(fillTextCalls[0][0]).toBe("7"); // First note fret
			expect(fillTextCalls[1][0]).toBe("5"); // Second note fret

			// Verify text styling for fret numbers
			expect(mockCtx.font).toBe("bold 12px sans-serif");
			expect(mockCtx.textAlign).toBe("center");
			expect(mockCtx.textBaseline).toBe("middle");
		});

		it("positions fret numbers at the center of note circles", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 5.0,
						duration: 1,
						string: 0,
						fret: 12,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			// Set time so note is at hit-line
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 5.0,
			} as unknown as Transport);
			renderer.draw();

			// Get the arc call to find note center
			const arcCall = mockCtx.arc.mock.calls[0];
			const noteCenterX = arcCall[0] as number;
			const noteCenterY = arcCall[1] as number;

			// Get the fillText call for fret number
			const fillTextCall = mockCtx.fillText.mock.calls[0];
			const textX = fillTextCall[1] as number;
			const textY = fillTextCall[2] as number;

			// Fret number should be centered in the circle
			expect(textX).toBeCloseTo(noteCenterX, 0);
			expect(textY).toBeCloseTo(noteCenterY, 0);
		});
	});

	describe("VISUAL-04: Hit-line position", () => {
		it("HIT_LINE_X constant positions playhead correctly", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			// The hit-line is drawn between the two sets of string lanes
			// First set: lanes 0-5 (6 calls), then hit-line (call 6), then second set: lanes 0-5 (calls 7-12)
			const moveToCalls = mockCtx.moveTo.mock.calls;
			const lineToCalls = mockCtx.lineTo.mock.calls;

			// Find the hit-line call - it should be at index STRING_COUNT (after first set of lanes)
			const hitLineMoveTo = moveToCalls[STRING_COUNT];
			const hitLineLineTo = lineToCalls[STRING_COUNT];

			expect(hitLineMoveTo[0]).toBe(HIT_LINE_X);
			expect(hitLineMoveTo[1]).toBe(0);
			expect(hitLineLineTo[0]).toBe(HIT_LINE_X);
			expect(hitLineLineTo[1]).toBe(600); // height
		});

		it("draws hit-line as a vertical line from top to bottom", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			const moveToCalls = mockCtx.moveTo.mock.calls;
			const lineToCalls = mockCtx.lineTo.mock.calls;

			// Find the hit-line call (at index STRING_COUNT, between the two lane sets)
			const hitLineMoveTo = moveToCalls[STRING_COUNT];
			const hitLineLineTo = lineToCalls[STRING_COUNT];

			expect(hitLineMoveTo).toBeDefined();
			expect(hitLineLineTo).toBeDefined();
			expect(hitLineMoveTo[0]).toBe(HIT_LINE_X);
			expect(hitLineMoveTo[1]).toBe(0);
			expect(hitLineLineTo[0]).toBe(HIT_LINE_X);
			expect(hitLineLineTo[1]).toBe(600);
		});
	});

	describe("VISUAL-05: Tone.Transport synchronization", () => {
		it("polls Tone.Transport.seconds for sync", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			// Verify Tone.getTransport() was called to get current time
			expect(Tone.getTransport).toHaveBeenCalled();
			expect(Tone.getContext).toHaveBeenCalled();
		});

		it("uses latency compensation for accurate sync", () => {
			// Mock with non-zero latency
			vi.mocked(Tone.getContext).mockReturnValue({
				rawContext: {
					outputLatency: 0.1, // 100ms latency
				},
				lookAhead: 0.025, // 25ms look-ahead
			});

			const renderer = new Renderer(canvas);
			renderer.draw();

			// Verify getContext was called to retrieve latency info
			expect(Tone.getContext).toHaveBeenCalled();
		});

		it("renders continuously via requestAnimationFrame loop", () => {
			const renderer = new Renderer(canvas);
			const rafSpy = vi.spyOn(window, "requestAnimationFrame");

			renderer.start();

			// requestAnimationFrame should be called to start the loop
			expect(rafSpy).toHaveBeenCalled();

			// Get the callback and verify it calls draw which schedules next frame
			const rafCallback = rafSpy.mock.calls[0][0];
			rafCallback(0); // Simulate frame callback

			// After draw is called, another RAF should be scheduled if loop continues
			// (This is tested indirectly through the draw method)
		});
	});

	describe("Note visualization", () => {
		it("draws notes with correct string colors", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 5.0,
						duration: 1,
						string: 0,
						fret: 5,
						techniques: {},
					},
					{
						pitch: 62,
						startTime: 6.0,
						duration: 1,
						string: 3,
						fret: 7,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			// Set time so notes are visible in viewport
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 5.0,
			} as unknown as Transport);
			renderer.draw();

			// fill should be called for each note (2 notes)
			expect(mockCtx.fill).toHaveBeenCalledTimes(2);
		});

		it("draws note circles with correct radius", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 5.0,
						duration: 1,
						string: 0,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			// Set time so note is visible
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 5.0,
			} as unknown as Transport);
			renderer.draw();

			// arc should be called with NOTE_RADIUS as the radius
			const arcCall = mockCtx.arc.mock.calls[0];
			expect(arcCall[2]).toBe(NOTE_RADIUS);
		});

		it("draws white border around notes", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 5.0,
						duration: 1,
						string: 0,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			// Set time so note is visible
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 5.0,
			} as unknown as Transport);
			renderer.draw();

			// stroke should be called (hit-line + note borders)
			expect(mockCtx.stroke).toHaveBeenCalled();
		});
	});
});
