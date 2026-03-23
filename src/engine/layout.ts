import type { PlaybackNote } from "../domain/types";
import { HIT_LINE_X, LANE_HEIGHT, PIXELS_PER_SECOND } from "./constants";

/**
 * Calculates X coordinate relative to hit-line
 */
export function getNoteX(startTime: number, currentTime: number): number {
	return HIT_LINE_X + (startTime - currentTime) * PIXELS_PER_SECOND;
}

/**
 * Calculates Y coordinate for a string lane
 * 0 is highest string index (lowest pitch), 5 is lowest string index (highest pitch)
 * We want string 0 (E low) at the bottom and string 5 (E high) at the top.
 */
export function getNoteY(stringIndex: number): number {
	// stringIndex 0 -> top, 5 -> bottom
	return stringIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
}

/**
 * Returns notes that overlap the current viewport plus a small buffer
 */
export function calculateVisibleNotes(
	notes: PlaybackNote[],
	currentTime: number,
	viewportWidth: number,
): PlaybackNote[] {
	const BUFFER_SECONDS = 0.5;
	const viewportStartSeconds = Math.max(
		0,
		currentTime - HIT_LINE_X / PIXELS_PER_SECOND - BUFFER_SECONDS,
	);
	const viewportEndSeconds =
		currentTime +
		(viewportWidth - HIT_LINE_X) / PIXELS_PER_SECOND +
		BUFFER_SECONDS;

	return notes.filter((note) => {
		const noteEndTime = note.startTime + note.duration;
		// Note is visible if it starts before viewport ends AND ends after viewport starts
		return (
			note.startTime <= viewportEndSeconds &&
			noteEndTime >= viewportStartSeconds
		);
	});
}
