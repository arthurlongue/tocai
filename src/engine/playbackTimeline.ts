import * as Tone from "tone";

/**
 * Internal state for synchronizing song time with Tone.Transport time.
 * This allows for speed changes and seeking without losing playback position.
 */
type PlaybackTimelineState = {
	/** Song time (seconds) at the moment of the last sync/anchor. */
	anchorSongSeconds: number;
	/** Tone.Transport time (seconds) at the moment of the last sync/anchor. */
	anchorTransportSeconds: number;
	/** Current playback speed multiplier (1.0 = normal speed). */
	speed: number;
};

const state: PlaybackTimelineState = {
	anchorSongSeconds: 0,
	anchorTransportSeconds: 0,
	speed: 1,
};

/** Ensures song seconds never go below zero. */
const clampSongSeconds = (seconds: number): number => Math.max(0, seconds);

/**
 * Converts Tone.Transport time to song time, accounting for playback speed.
 *
 * @param rawTransportSeconds - Current transport time (defaults to Tone.getTransport().seconds)
 * @returns The corresponding song time in seconds
 */
export const getPlaybackTimelineTime = (
	rawTransportSeconds: number = Tone.getTransport().seconds,
): number => {
	const elapsedTransportSeconds =
		rawTransportSeconds - state.anchorTransportSeconds;
	return clampSongSeconds(
		state.anchorSongSeconds + elapsedTransportSeconds * state.speed,
	);
};

/**
 * Converts song time back to Tone.Transport time, accounting for playback speed.
 * Useful for seeking to a specific position in the song.
 *
 * @param songSeconds - Target song time in seconds
 * @returns The corresponding transport time to seek to
 */
export const getTransportSecondsForSongTime = (songSeconds: number): number => {
	const targetSongSeconds = clampSongSeconds(songSeconds);

	if (state.speed === 0) {
		return state.anchorTransportSeconds;
	}

	return Math.max(
		0,
		state.anchorTransportSeconds +
			(targetSongSeconds - state.anchorSongSeconds) / state.speed,
	);
};

/**
 * Updates the playback speed, creating a new anchor point.
 * This prevents time distortion when speed changes during playback.
 *
 * @param speed - New playback speed multiplier
 * @param rawTransportSeconds - Current transport time (defaults to Tone.getTransport().seconds)
 */
export const setPlaybackTimelineSpeed = (
	speed: number,
	rawTransportSeconds: number = Tone.getTransport().seconds,
): void => {
	state.anchorSongSeconds = getPlaybackTimelineTime(rawTransportSeconds);
	state.anchorTransportSeconds = rawTransportSeconds;
	state.speed = speed;
};

/**
 * Synchronizes the playback timeline with an explicit song time position.
 * Used when seeking or jumping to a specific position.
 *
 * @param songSeconds - Target song time in seconds
 * @param rawTransportSeconds - Current transport time (defaults to Tone.getTransport().seconds)
 */
export const syncPlaybackTimeline = (
	songSeconds: number,
	rawTransportSeconds: number = Tone.getTransport().seconds,
): void => {
	state.anchorSongSeconds = clampSongSeconds(songSeconds);
	state.anchorTransportSeconds = rawTransportSeconds;
};

/**
 * Resets the playback timeline to its initial state (position 0, speed 1).
 */
export const resetPlaybackTimelineState = (): void => {
	state.anchorSongSeconds = 0;
	state.anchorTransportSeconds = 0;
	state.speed = 1;
};
