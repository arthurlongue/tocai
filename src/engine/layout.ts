import type { PlaybackNote } from "../domain/types";
import { HIT_LINE_X, PIXELS_PER_SECOND } from "./constants";

/**
 * Binary search helper to find the first note that starts at or after a target time.
 * @param notes - Sorted array of playback notes by startTime
 * @param targetTime - The time to search for
 * @returns Index of the first matching note, or notes.length if none found
 */
const findFirstNoteStartingAtOrAfter = (
	notes: PlaybackNote[],
	targetTime: number,
): number => {
	let low = 0;
	let high = notes.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (notes[mid].startTime < targetTime) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	return low;
};

/**
 * Binary search helper to find the first note that starts strictly after a target time.
 * @param notes - Sorted array of playback notes by startTime
 * @param targetTime - The time to search for
 * @returns Index of the first note after target, or notes.length if none found
 */
const findFirstNoteStartingAfter = (
	notes: PlaybackNote[],
	targetTime: number,
): number => {
	let low = 0;
	let high = notes.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (notes[mid].startTime <= targetTime) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	return low;
};

/**
 * Calculates the X coordinate of a note relative to the hit-line.
 *
 * @param startTime - When the note starts (in seconds)
 * @param currentTime - The current playback time (in seconds)
 * @returns The X coordinate in pixels where the note should be drawn
 */
export function getNoteX(startTime: number, currentTime: number): number {
	return HIT_LINE_X + (startTime - currentTime) * PIXELS_PER_SECOND;
}

/**
 * Calculates the Y coordinate for a note in its string lane.
 *
 * @param stringIndex - 0-based string index (0 = lowest string E, 5 = highest string e)
 * @param laneHeight - Height of each string lane in pixels
 * @returns The Y coordinate in pixels for the center of the string lane
 */
export function getNoteY(stringIndex: number, laneHeight: number): number {
	return stringIndex * laneHeight + laneHeight / 2;
}

/**
 * Returns all notes that are visible (or potentially visible) within the current viewport.
 * Includes a buffer zone to prevent pop-in when scrolling.
 *
 * @param notes - All playback notes to filter
 * @param currentTime - The current playback time (in seconds)
 * @param viewportWidth - Width of the viewport in pixels
 * @param maxNoteDuration - Maximum note duration to consider for buffer calculation
 * @returns Array of notes that overlap the visible time range
 */
export function calculateVisibleNotes(
	notes: PlaybackNote[],
	currentTime: number,
	viewportWidth: number,
	maxNoteDuration: number = 0,
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
	const searchStartSeconds = Math.max(
		0,
		viewportStartSeconds - maxNoteDuration,
	);
	const startIndex = findFirstNoteStartingAtOrAfter(notes, searchStartSeconds);
	const endIndex = findFirstNoteStartingAfter(notes, viewportEndSeconds);
	const visibleNotes: PlaybackNote[] = [];

	for (let index = startIndex; index < endIndex; index++) {
		const note = notes[index];
		const noteEndTime = note.startTime + note.duration;
		if (
			note.startTime <= viewportEndSeconds &&
			noteEndTime >= viewportStartSeconds
		) {
			visibleNotes.push(note);
		}
	}

	return visibleNotes;
}
