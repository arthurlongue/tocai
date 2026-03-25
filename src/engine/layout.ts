import type { PlaybackNote } from "../domain/types";
import { HIT_LINE_X, PIXELS_PER_SECOND } from "./constants";

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
export function getNoteY(stringIndex: number, laneHeight: number): number {
	// stringIndex 0 -> top, 5 -> bottom
	return stringIndex * laneHeight + laneHeight / 2;
}

/**
 * Returns notes that overlap the current viewport plus a small buffer
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
