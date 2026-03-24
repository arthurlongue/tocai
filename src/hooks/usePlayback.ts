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
	}, []);

	const pause = useCallback(() => {
		Tone.getTransport().pause();
	}, []);

	const stop = useCallback(() => {
		// stopAll also calls Tone.getTransport().stop()
		engine.stopAll();
		// Reset renderer's musical time accumulator
		// This ensures visual sync restarts from 0 on stop
		const canvas = document.querySelector("#visualizer canvas") as HTMLCanvasElement;
		if (canvas) {
			const renderer = (canvas as any).__renderer;
			if (renderer && typeof renderer.resetTime === "function") {
				renderer.resetTime();
			}
		}
	}, [engine]);

	const seek = useCallback((seconds: number) => {
		Tone.getTransport().seconds = seconds;
		// Reset renderer's musical time accumulator on seek
		// This ensures visual position matches the seeked audio position
		const canvas = document.querySelector("#visualizer canvas") as HTMLCanvasElement;
		if (canvas) {
			const renderer = (canvas as any).__renderer;
			if (renderer && typeof renderer.resetTime === "function") {
				renderer.resetTime();
				renderer.musicalTime = seconds; // Start from seeked position
			}
		}
	}, []);

	return {
		play,
		pause,
		stop,
		seek,
	};
};
