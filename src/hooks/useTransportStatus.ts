import { useEffect, useState } from "react";
import * as Tone from "tone";

export type TransportStatus = "started" | "paused" | "stopped";

/**
 * Hook to observe the Tone.Transport state.
 * Syncs the current transport state with React component lifecycle.
 */
export const useTransportStatus = (): TransportStatus => {
	const [status, setStatus] = useState<TransportStatus>(
		Tone.getTransport().state,
	);

	useEffect(() => {
		// Event handlers for transport state changes
		const onStart = () => setStatus("started");
		const onPause = () => setStatus("paused");
		const onStop = () => setStatus("stopped");

		const transport = Tone.getTransport();
		transport.on("start", onStart);
		transport.on("pause", onPause);
		transport.on("stop", onStop);

		// Set initial state correctly
		setStatus(transport.state);

		return () => {
			transport.off("start", onStart);
			transport.off("pause", onPause);
			transport.off("stop", onStop);
		};
	}, []);

	return status;
};
