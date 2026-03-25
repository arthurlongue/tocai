import { useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Track } from "../domain/types";
import { MinimapRenderer } from "../engine/MinimapRenderer";
import { useTransportStatus } from "../hooks/useTransportStatus";

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
	const transportStatus = useTransportStatus();
	const transportStatusRef = useRef(transportStatus);

	useEffect(() => {
		transportStatusRef.current = transportStatus;
	}, [transportStatus]);

	const stopAnimation = () => {
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
	};

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
		(canvas as HTMLCanvasElement & { __minimapRenderer?: MinimapRenderer }).__minimapRenderer = renderer;

		const drawIdleFrame = () => {
			if (!rendererRef.current) return;

			const currentTime =
				transportStatusRef.current === "paused"
					? Tone.getTransport().seconds
					: 0;
			rendererRef.current.draw(currentTime);
		};

		const startAnimation = () => {
			stopAnimation();
			const animate = () => {
				if (rendererRef.current) {
					rendererRef.current.draw(Tone.getTransport().seconds);
				}
				animationFrameRef.current = requestAnimationFrame(animate);
			};
			animate();
		};

		const resizeCanvas = () => {
			const nextRect = canvas.getBoundingClientRect();
			const nextWidth = nextRect.width * dpr;
			const nextHeight = nextRect.height * dpr;

			if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
				canvas.width = nextWidth;
				canvas.height = nextHeight;
			}

			if (!rendererRef.current) return;

			if (transportStatusRef.current === "started") {
				rendererRef.current.draw(Tone.getTransport().seconds);
				return;
			}

			drawIdleFrame();
		};

		resizeCanvas();
		if (transportStatusRef.current === "started") {
			startAnimation();
		} else {
			drawIdleFrame();
		}
		window.addEventListener("resize", resizeCanvas);

		return () => {
			stopAnimation();
			window.removeEventListener("resize", resizeCanvas);
			delete (
				canvas as HTMLCanvasElement & { __minimapRenderer?: MinimapRenderer }
			).__minimapRenderer;
		};
	}, [track, songDuration]);

	useEffect(() => {
		const renderer = rendererRef.current;
		if (!renderer) return;

		if (transportStatus === "started") {
			stopAnimation();
			const animate = () => {
				if (rendererRef.current) {
					rendererRef.current.draw(Tone.getTransport().seconds);
				}
				animationFrameRef.current = requestAnimationFrame(animate);
			};
			animate();
			return () => {
				stopAnimation();
			};
		}

		stopAnimation();
		const currentTime =
			transportStatus === "paused" ? Tone.getTransport().seconds : 0;
		renderer.draw(currentTime);
	}, [transportStatus]);

	// Handle click to seek
	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!rendererRef.current || !canvasRef.current) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const time = rendererRef.current.getTimeFromX(x);
		rendererRef.current.draw(time);
		onSeek(time);
	};

	return (
		<div className="w-full bg-surface border-b border-border minimap-container">
			<canvas
				ref={canvasRef}
				className="w-full h-12 cursor-pointer"
				data-testid="minimap-canvas"
				onPointerDown={handlePointerDown}
			/>
		</div>
	);
};
