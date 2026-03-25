import { useEffect, useState } from "react";
import * as Tone from "tone";

export type TransportStatus = "started" | "paused" | "stopped";
type TransportEvent = "start" | "pause" | "stop";
type TransportWithEvents = ReturnType<typeof Tone.getTransport> & {
	on?: (event: TransportEvent, callback: () => void) => void;
	off?: (event: TransportEvent, callback: () => void) => void;
};

/**
 * Hook to observe the Tone.Transport state.
 * Syncs the current transport state with React component lifecycle.
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
