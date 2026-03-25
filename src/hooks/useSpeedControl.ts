import { useCallback, useEffect, useState } from "react";
import { AudioEngine } from "../engine/AudioEngine";
import { setPlaybackTimelineSpeed } from "../engine/playbackTimeline";

// Shared ref across all hook instances - stores current speed
const speedRef = { current: 1.0 };

// Force re-render helper
let forceUpdateCallbacks: (() => void)[] = [];

/**
 * Hook for controlling playback speed (tempo)
 * Returns speed multiplier, setter, and reset function
 *
 * IMPORTANT: Uses a shared ref + force update pattern because useState
 * creates isolated state per component. All components share the same speed value.
 */
export const useSpeedControl = () => {
	const engine = AudioEngine.getInstance();

	// Create a force update mechanism for this component
	const [, setTick] = useState(0);

	// Register/deregister this component for force updates
	useEffect(() => {
		const forceUpdate = () => setTick((t) => t + 1);
		forceUpdateCallbacks.push(forceUpdate);
		return () => {
			forceUpdateCallbacks = forceUpdateCallbacks.filter(
				(cb) => cb !== forceUpdate,
			);
		};
	}, []);

	const setSpeed = useCallback(
		(multiplier: number) => {
			// Clamp to valid range (0.25 to 2.0)
			const clamped = Math.max(0.25, Math.min(2.0, multiplier));
			speedRef.current = clamped;
			setPlaybackTimelineSpeed(clamped);
			engine.setSpeed(clamped);
			// Force all components to re-render
			forceUpdateCallbacks.forEach((cb) => cb());
		},
		[engine],
	);

	const resetSpeed = useCallback(() => {
		speedRef.current = 1;
		setPlaybackTimelineSpeed(1);
		engine.setSpeed(1);
		forceUpdateCallbacks.forEach((cb) => cb());
	}, [engine]);

	return {
		speed: speedRef.current,
		setSpeed,
		resetSpeed,
	};
};
