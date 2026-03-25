import { useCallback, useState } from "react";
import { AudioEngine } from "../engine/AudioEngine";
import { setPlaybackTimelineSpeed } from "../engine/playbackTimeline";

const MIN_PLAYBACK_SPEED = 0.25;
const MAX_PLAYBACK_SPEED = 2;

const clampPlaybackSpeed = (multiplier: number): number =>
	Math.max(MIN_PLAYBACK_SPEED, Math.min(MAX_PLAYBACK_SPEED, multiplier));

/**
 * Hook for controlling playback speed (tempo) within a single owner component.
 * The caller should lift this state and pass it down explicitly.
 */
export const useSpeedControl = () => {
	const engine = AudioEngine.getInstance();
	const [speed, setCurrentSpeed] = useState(1);

	const setSpeed = useCallback(
		(multiplier: number) => {
			const clamped = clampPlaybackSpeed(multiplier);
			setCurrentSpeed(clamped);
			setPlaybackTimelineSpeed(clamped);
			engine.setSpeed(clamped);
		},
		[engine],
	);

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
