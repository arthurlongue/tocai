import { describe, expect, it } from "vitest";
import type { PlaybackNote } from "../domain/types";
import { HIT_LINE_X, PIXELS_PER_SECOND } from "./constants";
import { calculateVisibleNotes, getNoteX, getNoteY } from "./layout";

describe("Layout Math", () => {
	describe("getNoteX", () => {
		it("calculates the correct X position for a note at hit-line", () => {
			// 100 + (1.0 - 1.0) * 200 = 100
			expect(getNoteX(1.0, 1.0)).toBe(100);
		});

		it("calculates the correct X position for a note in future", () => {
			// 100 + (2.0 - 1.0) * 200 = 300
			expect(getNoteX(2.0, 1.0)).toBe(300);
		});

		it("calculates the correct X position for a note in past", () => {
			// 100 + (0.0 - 1.0) * 200 = -100
			expect(getNoteX(0.0, 1.0)).toBe(-100);
		});
	});

	describe("getNoteY", () => {
		it("calculates the correct Y position for each string", () => {
			// STRING_COUNT = 6, LANE_HEIGHT = 40
			// 0: 0*40 + 20 = 20
			expect(getNoteY(0, 40)).toBe(20);
			// 5: 5*40 + 20 = 220
			expect(getNoteY(5, 40)).toBe(220);
		});
	});

	describe("calculateVisibleNotes", () => {
		const notes: PlaybackNote[] = [
			{
				startTime: 0.1,
				duration: 0.1,
				pitch: 0,
				string: 0,
				fret: 0,
				techniques: {},
			},
			{
				startTime: 2.0,
				duration: 0.1,
				pitch: 0,
				string: 0,
				fret: 0,
				techniques: {},
			},
			{
				startTime: 10.0,
				duration: 0.1,
				pitch: 0,
				string: 0,
				fret: 0,
				techniques: {},
			},
		];

		it("returns only notes that are within the viewport buffer", () => {
			const currentTime = 2.0;
			const viewportWidth = 800;
			// viewportStartSeconds = 2.0 - (100/200) - 0.5 = 2.0 - 0.5 - 0.5 = 1.0
			// viewportEndSeconds = 2.0 + ((800-100)/200) + 0.5 = 2.0 + 3.5 + 0.5 = 6.0
			const visible = calculateVisibleNotes(notes, currentTime, viewportWidth);
			expect(visible).toHaveLength(1);
			expect(visible[0].startTime).toBe(2.0);
		});

		it("keeps long notes that started before the viewport but still overlap it", () => {
			const longNote: PlaybackNote = {
				startTime: 0.2,
				duration: 1.5,
				pitch: 0,
				string: 0,
				fret: 0,
				techniques: {},
			};

			const visible = calculateVisibleNotes([longNote], 1.0, 800, 1.5);
			expect(visible).toHaveLength(1);
			expect(visible[0]).toBe(longNote);
		});
	});

		it("PIXELS_PER_SECOND scales time to distance correctly", () => {
			expect(PIXELS_PER_SECOND).toBe(200);

			// A note 1 second in the future should be PIXELS_PER_SECOND pixels to the right
			const oneSecondFuture = getNoteX(6.0, 5.0);
			expect(oneSecondFuture).toBe(HIT_LINE_X + PIXELS_PER_SECOND);

			// A note 1 second in the past should be PIXELS_PER_SECOND pixels to the left
			const oneSecondPast = getNoteX(4.0, 5.0);
			expect(oneSecondPast).toBe(HIT_LINE_X - PIXELS_PER_SECOND);
		});
});
