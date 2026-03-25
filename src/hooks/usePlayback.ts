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
 * Handles the mandatory Tone.start() initialization on user gesture.
 */
export const usePlayback = () => {
	const engine = AudioEngine.getInstance();

	const play = useCallback(async () => {
		// Tone.start() is mandatory on user gesture (e.g., click) to enable audio context.
		// It is a no-op if the context is already started.
		await Tone.start();
		Tone.getTransport().start();
		syncVisualState(getPlaybackTimelineTime());
	}, []);

	const pause = useCallback(() => {
		Tone.getTransport().pause();
		syncVisualState(getPlaybackTimelineTime());
	}, []);

	const stop = useCallback(() => {
		// stopAll also calls Tone.getTransport().stop()
		engine.stopAll();
		syncPlaybackTimeline(0, Tone.getTransport().seconds);
		syncVisualState(0);
	}, [engine]);

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
