import { useCallback } from "react";
import * as Tone from "tone";
import { AudioEngine } from "../engine/AudioEngine";
import {
	getPlaybackTimelineTime,
	getTransportSecondsForSongTime,
	syncPlaybackTimeline,
} from "../engine/playbackTimeline";
import { syncVisualState } from "../engine/visualSync";

/**
 * Hook providing methods to control the Tone.Transport playback.
 *
 * This hook handles the mandatory `Tone.start()` initialization that must
 * occur from a user gesture (e.g., click) to enable the audio context.
 * It also synchronizes the visual timeline with playback state changes.
 *
 * @example
 * ```tsx
 * function PlayButton() {
 *   const { play } = usePlayback();
 *   return <button onClick={play}>Play</button>;
 * }
 * ```
 */
export const usePlayback = () => {
	const engine = AudioEngine.getInstance();

	/**
	 * Starts or resumes playback.
	 * Must be called from a user gesture to initialize the audio context.
	 */
	const play = useCallback(async () => {
		// Tone.start() is mandatory on user gesture (e.g., click) to enable audio context.
		// It is a no-op if the context is already started.
		await Tone.start();
		Tone.getTransport().start();
		syncVisualState(getPlaybackTimelineTime());
	}, []);

	/** Pauses playback at the current position. */
	const pause = useCallback(() => {
		Tone.getTransport().pause();
		syncVisualState(getPlaybackTimelineTime());
	}, []);

	/** Stops playback and resets to the beginning. */
	const stop = useCallback(() => {
		// stopAll also calls Tone.getTransport().stop()
		engine.stopAll();
		syncPlaybackTimeline(0, Tone.getTransport().seconds);
		syncVisualState(0);
	}, [engine]);

	/**
	 * Seeks to a specific position in the song.
	 *
	 * @param seconds - The target position in seconds
	 */
	const seek = useCallback(async (seconds: number) => {
		await Tone.start();
		const nextSongSeconds = Math.max(0, seconds);
		const nextTransportSeconds =
			getTransportSecondsForSongTime(nextSongSeconds);
		Tone.getTransport().seconds = nextTransportSeconds;
		syncPlaybackTimeline(nextSongSeconds, nextTransportSeconds);
		syncVisualState(nextSongSeconds);
	}, []);

	return {
		play,
		pause,
		stop,
		seek,
	};
};
