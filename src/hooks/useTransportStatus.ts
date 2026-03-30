import { useEffect, useState } from "react";
import * as Tone from "tone";

/** Possible states of the Tone.Transport playback. */
export type TransportStatus = "started" | "paused" | "stopped";
/** Event types emitted by Tone.Transport. */
type TransportEvent = "start" | "pause" | "stop";
/** Extended transport type with event emitter methods. */
type TransportWithEvents = ReturnType<typeof Tone.getTransport> & {
	on?: (event: TransportEvent, callback: () => void) => void;
	off?: (event: TransportEvent, callback: () => void) => void;
};

/**
 * Hook to observe the Tone.Transport playback state.
 *
 * Subscribes to Tone.Transport events and returns the current playback state,
 * synced with React's component lifecycle. This allows React components to
 * respond to playback state changes (e.g., updating play/pause buttons).
 *
 * @returns The current transport status: "started", "paused", or "stopped"
 *
 * @example
 * ```tsx
 * function PlayButton() {
 *   const status = useTransportStatus();
 *   const { play, pause, stop } = usePlayback();
 *
 *   return (
 *     <div>
 *       {status === "started" ? (
 *         <button onClick={pause}>Pause</button>
 *       ) : (
 *         <button onClick={play}>Play</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useTransportStatus = (): TransportStatus => {
	const [status, setStatus] = useState<TransportStatus>(() => {
		const transport = Tone.getTransport() as TransportWithEvents;
		return transport.state ?? "stopped";
	});

	useEffect(() => {
		// Event handlers for transport state changes
		const onStart = () => setStatus("started");
		const onPause = () => setStatus("paused");
		const onStop = () => setStatus("stopped");

		const transport = Tone.getTransport() as TransportWithEvents;

		// Set initial state correctly
		setStatus(transport.state ?? "stopped");

		if (
			typeof transport.on !== "function" ||
			typeof transport.off !== "function"
		) {
			return;
		}

		transport.on("start", onStart);
		transport.on("pause", onPause);
		transport.on("stop", onStop);

		return () => {
			transport.off?.("start", onStart);
			transport.off?.("pause", onPause);
			transport.off?.("stop", onStop);
		};
	}, []);

	return status;
};
