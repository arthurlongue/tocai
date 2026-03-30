import { useCallback, useState } from "react";
import { AudioEngine } from "../engine/AudioEngine";
import { setPlaybackTimelineSpeed } from "../engine/playbackTimeline";

/** Minimum allowed playback speed multiplier. */
const MIN_PLAYBACK_SPEED = 0.25;
/** Maximum allowed playback speed multiplier. */
const MAX_PLAYBACK_SPEED = 2;

/** Clamps a speed multiplier to the allowed range. */
const clampPlaybackSpeed = (multiplier: number): number =>
	Math.max(MIN_PLAYBACK_SPEED, Math.min(MAX_PLAYBACK_SPEED, multiplier));

/**
 * Hook for controlling playback speed (tempo) within a single owner component.
 *
 * Provides state and callbacks for adjusting playback speed, which is
 * implemented by changing the Tone.Transport BPM. The caller should lift
 * this state and pass it down explicitly.
 *
 * @example
 * ```tsx
 * function SpeedControl() {
 *   const { speed, setSpeed, resetSpeed } = useSpeedControl();
 *   return (
 *     <div>
 *       <span>Speed: {speed}x</span>
 *       <button onClick={() => setSpeed(0.5)}>0.5x</button>
 *       <button onClick={() => setSpeed(1)}>1x</button>
 *       <button onClick={resetSpeed}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useSpeedControl = () => {
	const engine = AudioEngine.getInstance();
	const [speed, setCurrentSpeed] = useState(1);

	/**
	 * Sets the playback speed multiplier.
	 * @param multiplier - The desired speed (clamped to 0.25–2.0 range)
	 */
	const setSpeed = useCallback(
		(multiplier: number) => {
			const clamped = clampPlaybackSpeed(multiplier);
			setCurrentSpeed(clamped);
			setPlaybackTimelineSpeed(clamped);
			engine.setSpeed(clamped);
		},
		[engine],
	);

	/** Resets playback speed to 1.0 (normal speed). */
	const resetSpeed = useCallback(() => {
		setCurrentSpeed(1);
		setPlaybackTimelineSpeed(1);
		engine.setSpeed(1);
	}, [engine]);

	return {
		speed,
		setSpeed,
		resetSpeed,
	};
};
