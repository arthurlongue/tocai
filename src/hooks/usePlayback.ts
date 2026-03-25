import { useCallback } from "react";
import * as Tone from "tone";
import { AudioEngine } from "../engine/AudioEngine";
import type { MinimapRenderer } from "../engine/MinimapRenderer";
import {
	getPlaybackTimelineTime,
	syncPlaybackTimeline,
} from "../engine/playbackTimeline";
import type { Renderer } from "../engine/Renderer";

const syncVisualState = (seconds: number) => {
	const visualizerCanvas = document.querySelector(
		'[data-testid="visualizer-canvas"]',
	) as (HTMLCanvasElement & { __renderer?: Renderer }) | null;
	const minimapCanvas = document.querySelector(
		'[data-testid="minimap-canvas"]',
	) as (HTMLCanvasElement & { __minimapRenderer?: MinimapRenderer }) | null;

	visualizerCanvas?.__renderer?.drawAt(seconds);
	minimapCanvas?.__minimapRenderer?.draw(seconds);
};

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
		Tone.getTransport().seconds = seconds;
		syncPlaybackTimeline(seconds, Tone.getTransport().seconds);
		syncVisualState(seconds);
	}, []);

	return {
		play,
		pause,
		stop,
		seek,
	};
};
