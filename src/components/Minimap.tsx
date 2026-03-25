import { useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Track } from "../domain/types";
import { MinimapRenderer } from "../engine/MinimapRenderer";

interface MinimapProps {
	track: Track | undefined;
	songDuration: number;
	onSeek: (time: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
	track,
	songDuration,
	onSeek,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<MinimapRenderer | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	// Initialize renderer
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !track) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		// Set canvas dimensions with DPR scaling
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		const renderer = new MinimapRenderer(canvas);
		renderer.setTrack(track, songDuration);
		rendererRef.current = renderer;

		// Animation loop for playhead
		const animate = () => {
			if (rendererRef.current) {
				const seconds = Tone.getTransport().seconds;
				rendererRef.current.draw(seconds);
			}
			animationFrameRef.current = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			// Clean up renderer reference
			delete (canvas as any).__minimapRenderer;
		};
	}, [track, songDuration]);

	// Handle click to seek
	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!rendererRef.current) return;

		const rect = canvasRef.current!.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const time = rendererRef.current.getTimeFromX(x);
		onSeek(time);
	};

	return (
		<div className="w-full bg-surface border-b border-border minimap-container">
			<canvas
				ref={canvasRef}
				className="w-full h-12 cursor-pointer"
				onPointerDown={handlePointerDown}
			/>
		</div>
	);
};
