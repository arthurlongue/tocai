import { useCallback } from "react";
import * as Tone from "tone";
import { AudioEngine } from "../engine/AudioEngine";

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
		// Initialize renderer's musical time to match current Transport position
		// This ensures visual sync is correct when starting playback
		const canvas = document.querySelector("#visualizer canvas") as HTMLCanvasElement;
		if (canvas) {
			const renderer = (canvas as any).__renderer;
			if (renderer && typeof renderer.initTime === "function") {
				renderer.initTime();
			}
		}
	}, []);

	const pause = useCallback(() => {
		Tone.getTransport().pause();
	}, []);

	const stop = useCallback(() => {
		// stopAll also calls Tone.getTransport().stop()
		engine.stopAll();
	}, [engine]);

	const seek = useCallback((seconds: number) => {
		Tone.getTransport().seconds = seconds;
	}, []);

	return {
		play,
		pause,
		stop,
		seek,
	};
};
