import type React from "react";
import { useEffect, useRef } from "react";
import type { Track } from "../domain/types";
import { Renderer } from "../engine/Renderer";

interface VisualizerProps {
	track?: Track;
}

export const Visualizer: React.FC<VisualizerProps> = ({ track }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<Renderer | null>(null);

	// Resize logic for HiDPI/Retina
	const resizeCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		// Set physical dimensions
		canvas.width = width * dpr;
		canvas.height = height * dpr;

		// Set logical dimensions via CSS if not already set by parent
		// (Usually handled by CSS width: 100%, height: 100%)

		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
	};

	// Initialize Renderer
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Initial resize
		resizeCanvas();

		const renderer = new Renderer(canvas);
		rendererRef.current = renderer;

		if (track) {
			renderer.setTrack(track);
		}

		renderer.start();

		const handleResize = () => {
			resizeCanvas();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			renderer.stop();
			window.removeEventListener("resize", handleResize);
		};
	}, [
		track,
	]);

	// Update track when it changes
	useEffect(() => {
		if (rendererRef.current && track) {
			rendererRef.current.setTrack(track);
		}
	}, [track]);

	return (
		<div className="relative w-full h-[400px] bg-slate-900 border-y border-slate-700 overflow-hidden">
			<canvas ref={canvasRef} className="w-full h-full block" />
		</div>
	);
};
