import type React from "react";
import { useEffect, useRef } from "react";
import type { Track } from "../domain/types";
import { Renderer } from "../engine/Renderer";

interface VisualizerProps {
	track?: Track;
	speed?: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ track, speed = 1.0 }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<Renderer | null>(null);

	// Initialize Renderer
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;

		const resizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = parent.getBoundingClientRect();

			// Only resize if dimensions are valid
			if (rect.width === 0 || rect.height === 0) return;

			const newWidth = rect.width * dpr;
			const newHeight = rect.height * dpr;

			if (canvas.width !== newWidth || canvas.height !== newHeight) {
				// Set physical dimensions
				canvas.width = newWidth;
				canvas.height = newHeight;

				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				}

				if (rendererRef.current) {
					rendererRef.current.draw();
				}
			}
		};

		// Initial resize
		resizeCanvas();

		const renderer = new Renderer(canvas);
		rendererRef.current = renderer;

		if (track) {
			renderer.setTrack(track);
		}

		// Initialize speed if provided
		if (speed !== undefined) {
			renderer.setSpeed(speed);
		}

		renderer.start();

		// Use ResizeObserver to reliably catch container size changes
		const observer = new ResizeObserver(() => {
			resizeCanvas();
		});
		observer.observe(parent);

		// Also listen to window resize as fallback
		window.addEventListener("resize", resizeCanvas);

		return () => {
			renderer.stop();
			observer.disconnect();
			window.removeEventListener("resize", resizeCanvas);
		};
	}, [track]); // NOTE: Don't add speed here - it would recreate the Renderer

	// Update track when it changes
	useEffect(() => {
		if (rendererRef.current && track) {
			rendererRef.current.setTrack(track);
		}
	}, [track]);

	// Update speed when it changes
	useEffect(() => {
		if (rendererRef.current && speed !== undefined) {
			console.log("[Visualizer] Setting speed:", speed);
			rendererRef.current.setSpeed(speed);
		}
	}, [speed]);

	return (
		<div
			className="relative w-full bg-slate-900 border-y border-slate-700 overflow-hidden"
			style={{ height: "500px" }}
		>
			<canvas ref={canvasRef} className="w-full h-full block" />
		</div>
	);
};
