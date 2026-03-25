import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Track } from "../domain/types";
import { getPlaybackTimelineTime } from "../engine/playbackTimeline";
import { Renderer } from "../engine/Renderer";
import { subscribeToVisualSync } from "../engine/visualSync";
import { useTransportStatus } from "../hooks/useTransportStatus";

interface VisualizerProps {
	track?: Track;
	speed?: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({
	track,
	speed = 1.0,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<Renderer | null>(null);
	const transportStatus = useTransportStatus();
	const transportStatusRef = useRef(transportStatus);
	const getIdleCurrentTime = useCallback(
		() => getPlaybackTimelineTime(Tone.getTransport().seconds),
		[],
	);

	useEffect(() => {
		transportStatusRef.current = transportStatus;
	}, [transportStatus]);

	useEffect(() => {
		return subscribeToVisualSync((songSeconds) => {
			rendererRef.current?.drawAt(songSeconds);
		});
	}, []);

	// Initialize Renderer once and keep it alive for the component lifetime.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;

		const resizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = parent.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;

			const newWidth = rect.width * dpr;
			const newHeight = rect.height * dpr;

			if (canvas.width !== newWidth || canvas.height !== newHeight) {
				canvas.width = newWidth;
				canvas.height = newHeight;
				const ctx = canvas.getContext("2d");
				if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				if (rendererRef.current) {
					if (transportStatusRef.current === "started") {
						rendererRef.current.draw();
					} else {
						rendererRef.current.drawAt(getIdleCurrentTime());
					}
				}
			}
		};

		resizeCanvas();

		const renderer = new Renderer(canvas);
		rendererRef.current = renderer;

		const observer = new ResizeObserver(resizeCanvas);
		observer.observe(parent);
		window.addEventListener("resize", resizeCanvas);

		return () => {
			renderer.stop();
			observer.disconnect();
			window.removeEventListener("resize", resizeCanvas);
		};
	}, [getIdleCurrentTime]);

	// Keep renderer state aligned with the current track, speed, and transport mode.
	useEffect(() => {
		const renderer = rendererRef.current;
		if (!renderer) return;

		if (track) {
			renderer.setTrack(track);
		}

		renderer.setSpeed(speed);

		if (transportStatus === "started") {
			renderer.start();
			renderer.draw();
			return;
		}

		renderer.stop();
		renderer.drawAt(getIdleCurrentTime());
	}, [track, speed, transportStatus, getIdleCurrentTime]);

	return (
		<div
			className="relative w-full bg-slate-900 border-y border-slate-700 overflow-hidden visualizer"
			style={{ height: "500px" }}
		>
			<canvas ref={canvasRef} className="w-full h-full block" />
		</div>
	);
};
