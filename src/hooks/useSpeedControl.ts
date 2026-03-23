import { useCallback, useState } from "react";
import { AudioEngine } from "../engine/AudioEngine";

/**
 * Hook for controlling playback speed (tempo)
 * Returns speed multiplier, setter, and reset function
 */
export const useSpeedControl = () => {
	const engine = AudioEngine.getInstance();
	const [speed, setSpeedState] = useState(1);

	const setSpeed = useCallback(
		(multiplier: number) => {
			// Clamp to valid range (0.25 to 2.0)
			const clamped = Math.max(0.25, Math.min(2.0, multiplier));
			setSpeedState(clamped);
			engine.setSpeed(clamped);
		},
		[engine],
	);

	const resetSpeed = useCallback(() => {
		setSpeedState(1);
		engine.setSpeed(1);
	}, [engine]);

	return { speed, setSpeed, resetSpeed };
};
