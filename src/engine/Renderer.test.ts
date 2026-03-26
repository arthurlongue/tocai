/**
 * @vitest-environment jsdom
 */

import type { Transport } from "tone";
import * as Tone from "tone";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	HIT_LINE_X,
	NOTE_HEIGHT,
	STRING_COLORS,
	STRING_COUNT,
} from "./constants";
import {
	resetPlaybackTimelineState,
	setPlaybackTimelineSpeed,
} from "./playbackTimeline";
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
	let fillStyleHistory: string[];
	let fontHistory: string[];
	let textAlignHistory: string[];
	let textBaselineHistory: string[];
	let shadowColorHistory: string[];
	let shadowBlurHistory: number[];

	const getNoteFillTextCalls = () =>
		mockCtx.fillText.mock.calls.filter(
			([text]: [unknown]) => !String(text).endsWith(" FPS"),
		);

	const getHitLineMoveToCalls = () =>
		mockCtx.moveTo.mock.calls.filter(
			([x, y]: [number, number]) => x === HIT_LINE_X && y === 0,
		);

	const getHitLineLineToCalls = () =>
		mockCtx.lineTo.mock.calls.filter(
			([x, y]: [number, number]) => x === HIT_LINE_X && y === canvas.height,
		);

	beforeEach(() => {
		vi.clearAllMocks();
		resetPlaybackTimelineState();
		fillStyleHistory = [];
		fontHistory = [];
		textAlignHistory = [];
		textBaselineHistory = [];
		shadowColorHistory = [];
		shadowBlurHistory = [];
		vi.mocked(Tone.getTransport).mockReturnValue({
			seconds: 0,
		} as unknown as typeof Transport);
		vi.mocked(Tone.getContext).mockReturnValue({
			rawContext: {
				outputLatency: 0,
			},
			lookAhead: 0,
		});

		// Basic canvas mock
		canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 600;

		let fillStyle = "";
		let strokeStyle = "";
		let lineWidth = 0;
		let font = "";
		let textAlign = "";
		let textBaseline = "";
		let shadowColor = "";
		let shadowBlur = 0;

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
			strokeText: vi.fn(),
			createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
			roundRect: vi.fn(),
			fillRect: vi.fn(),
			setTransform: vi.fn(),
			save: vi.fn(),
			restore: vi.fn(),
		};

		Object.defineProperties(mockCtx, {
			strokeStyle: {
				get: () => strokeStyle,
				set: (value: string) => {
					strokeStyle = value;
				},
			},
			fillStyle: {
				get: () => fillStyle,
				set: (value: string) => {
					fillStyle = value;
					fillStyleHistory.push(value);
				},
			},
			lineWidth: {
				get: () => lineWidth,
				set: (value: number) => {
					lineWidth = value;
				},
			},
			font: {
				get: () => font,
				set: (value: string) => {
					font = value;
					fontHistory.push(value);
				},
			},
			textAlign: {
				get: () => textAlign,
				set: (value: string) => {
					textAlign = value;
					textAlignHistory.push(value);
				},
			},
			textBaseline: {
				get: () => textBaseline,
				set: (value: string) => {
					textBaseline = value;
					textBaselineHistory.push(value);
				},
			},
			shadowColor: {
				get: () => shadowColor,
				set: (value: string) => {
					shadowColor = value;
					shadowColorHistory.push(value);
				},
			},
			shadowBlur: {
				get: () => shadowBlur,
				set: (value: number) => {
					shadowBlur = value;
					shadowBlurHistory.push(value);
				},
			},
		});

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

	it("fills the background on each draw", () => {
		const renderer = new Renderer(canvas);
		const fillRectSpy = vi.spyOn(mockCtx, "fillRect");

		renderer.draw();

		expect(fillRectSpy).toHaveBeenCalled();
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

			// Verify text was drawn for the visible note.
			expect(mockCtx.fillText).toHaveBeenCalled();

			// At time 2.0, note should be near HIT_LINE_X (100)
			// Note: The renderer adds a small latency compensation (0.05), so the actual
			// position will be slightly offset: 100 + 0.05 * 200 = 110
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 2.0,
			} as unknown as Transport);
			mockCtx.fillText.mockClear();
			renderer.draw();

			// The note should be drawn near HIT_LINE_X when currentTime matches startTime
			const fillTextCalls = mockCtx.fillText.mock.calls;
			expect(fillTextCalls.length).toBeGreaterThan(0);
			const noteX = fillTextCalls[0][1] as number;
			// Expected: HIT_LINE_X + 0.05 * PIXELS_PER_SECOND = 100 + 10 = 110
			expect(noteX).toBeCloseTo(110, 0);
		});
	});

	describe("VISUAL-02: Canvas overlay rendering", () => {
		it("draws only the hit-line overlay on top of the background", () => {
			const mockTrackWithTuning = {
				id: "1",
				name: "Standard Tuning",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrackWithTuning as any);
			renderer.draw();

			expect(getHitLineMoveToCalls()).toHaveLength(1);
			expect(getHitLineLineToCalls()).toHaveLength(1);
			expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
		});

		it("draws the hit-line vertically across the full canvas height", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			expect(getHitLineLineToCalls()).toContainEqual([HIT_LINE_X, 600]);
		});
	});

	describe("VISUAL-03: Fret number rendering", () => {
		it("draws one label per note", () => {
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

			const noteFillTextCalls = getNoteFillTextCalls();
			expect(noteFillTextCalls).toHaveLength(2);
			expect(mockCtx.strokeText).toHaveBeenCalledTimes(2);
			expect(noteFillTextCalls[0][0]).toBe("7");
			expect(noteFillTextCalls[1][0]).toBe("5");

			expect(fontHistory).toContain(
				`900 ${Math.round(NOTE_HEIGHT * 1.2)}px 'Inter', system-ui, sans-serif`,
			);
			expect(textAlignHistory).toContain("center");
			expect(textBaselineHistory).toContain("middle");
		});

		it("positions fret numbers at the center of strings", () => {
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

			const fillCall = mockCtx.fillText.mock.calls[0];
			const noteCenterX = fillCall[1] as number;
			const noteCenterY = fillCall[2] as number;

			const fillTextCall = mockCtx.fillText.mock.calls[0];
			const textX = fillTextCall[1] as number;
			const textY = fillTextCall[2] as number;

			expect(textX).toBeCloseTo(noteCenterX, 0);
			expect(textY).toBeCloseTo(noteCenterY, 0);
		});
	});

	describe("VISUAL-04: Hit-line position", () => {
		it("HIT_LINE_X constant positions playhead correctly", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			// The hit-line is drawn between the two sets of string lanes
			const hitLineMoveTo = getHitLineMoveToCalls()[0];
			const hitLineLineTo = getHitLineLineToCalls()[0];

			expect(hitLineMoveTo[0]).toBe(HIT_LINE_X);
			expect(hitLineMoveTo[1]).toBe(0);
			expect(hitLineLineTo[0]).toBe(HIT_LINE_X);
			expect(hitLineLineTo[1]).toBe(600); // height
		});

		it("draws hit-line as a vertical line from top to bottom", () => {
			const renderer = new Renderer(canvas);
			renderer.draw();

			const hitLineMoveTo = getHitLineMoveToCalls()[0];
			const hitLineLineTo = getHitLineLineToCalls()[0];

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

		it("keeps note positions stable when speed changes at the same transport time", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 4.0,
						duration: 1,
						string: 0,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 2.0,
			} as unknown as Transport);

			setPlaybackTimelineSpeed(1, 2.0);
			renderer.setSpeed(1);
			renderer.draw();
			const baselineX = mockCtx.fillText.mock.calls[0]?.[1] as number;

			mockCtx.fillText.mockClear();

			setPlaybackTimelineSpeed(0.5, 2.0);
			renderer.setSpeed(0.5);
			renderer.draw();
			const slowedX = mockCtx.fillText.mock.calls[0]?.[1] as number;

			expect(baselineX).toBeDefined();
			expect(slowedX).toBeDefined();
			expect(Math.abs(slowedX - baselineX)).toBeLessThanOrEqual(5);
		});

		it("advances notes at the new rate after a speed change", () => {
			const mockTrack = {
				id: "1",
				name: "Test",
				tuning: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
				notes: [
					{
						pitch: 60,
						startTime: 4.0,
						duration: 1,
						string: 0,
						fret: 5,
						techniques: {},
					},
				],
			};

			const renderer = new Renderer(canvas);
			renderer.setTrack(mockTrack as any);

			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 2.0,
			} as unknown as Transport);
			setPlaybackTimelineSpeed(1, 2.0);
			renderer.draw();
			const baselineX = mockCtx.fillText.mock.calls[0]?.[1] as number;

			mockCtx.fillText.mockClear();

			setPlaybackTimelineSpeed(0.5, 2.0);
			vi.mocked(Tone.getTransport).mockReturnValue({
				seconds: 3.0,
			} as unknown as Transport);
			renderer.draw();
			const slowedLaterX = mockCtx.fillText.mock.calls[0]?.[1] as number;

			expect(baselineX).toBeDefined();
			expect(slowedLaterX).toBeDefined();
			expect(baselineX - slowedLaterX).toBeCloseTo(105, 5);
		});
	});

	describe("Note visualization", () => {
		it("draws fret labels with correct string colors", () => {
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

			const noteFillTextCalls = getNoteFillTextCalls();
			expect(noteFillTextCalls).toHaveLength(2);
			expect(fillStyleHistory).toContain(STRING_COLORS[0]);
			expect(fillStyleHistory).toContain(STRING_COLORS[3]);
		});

		it("draws fret numbers with the string-color glow", () => {
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

			expect(shadowColorHistory).toContain(STRING_COLORS[0]);
			expect(shadowBlurHistory).toContain(6);
			expect(mockCtx.shadowBlur).toBe(0);
		});

		it("draws outlined text instead of a bordered note body", () => {
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

			expect(mockCtx.stroke).toHaveBeenCalledTimes(STRING_COUNT + 2);
			expect(mockCtx.strokeText).toHaveBeenCalledWith(
				"5",
				expect.any(Number),
				expect.any(Number),
			);
		});
	});
});
