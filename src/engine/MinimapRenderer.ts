import type { Track } from "../domain/types";
import { STRING_COLORS, STRING_COUNT } from "./constants";

export class MinimapRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private track: Track | null = null;
	private songDuration: number = 0;
	private staticLayerCanvas: HTMLCanvasElement | null = null;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Could not get 2D context from canvas");
		}
		this.ctx = ctx;
	}

	setTrack(track: Track, songDuration?: number): void {
		this.track = track;
		this.songDuration = songDuration ?? this.calculateSongDuration(track);
		this.staticLayerCanvas = null;
		this.draw();
	}

	private calculateSongDuration(track: Track): number {
		if (track.notes.length === 0) return 0;
		return track.notes.reduce(
			(max, note) => Math.max(max, note.startTime + note.duration),
			0,
		);
	}

	draw(currentTime: number = 0): void {
		if (!this.track || this.songDuration === 0) return;

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		const height = this.canvas.height / dpr;
		const pixelsPerSecond = width / this.songDuration;
		const laneHeight = height / STRING_COUNT;
		const staticLayer = this.getOrCreateStaticLayer(
			dpr,
			width,
			height,
			pixelsPerSecond,
			laneHeight,
		);

		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (staticLayer) {
			this.ctx.drawImage(staticLayer, 0, 0);
		} else {
			this.ctx.save();
			this.ctx.scale(dpr, dpr);
			this.drawStaticLayer(
				this.ctx,
				width,
				height,
				pixelsPerSecond,
				laneHeight,
			);
			this.ctx.restore();
		}

		this.ctx.save();
		this.ctx.scale(dpr, dpr);
		this.drawPlayhead(width, height, currentTime, pixelsPerSecond);
		this.ctx.restore();
	}

	private getOrCreateStaticLayer(
		dpr: number,
		width: number,
		height: number,
		pixelsPerSecond: number,
		laneHeight: number,
	): HTMLCanvasElement | null {
		if (
			this.staticLayerCanvas &&
			this.staticLayerCanvas.width === this.canvas.width &&
			this.staticLayerCanvas.height === this.canvas.height
		) {
			return this.staticLayerCanvas;
		}

		const layerCanvas = document.createElement("canvas");
		layerCanvas.width = this.canvas.width;
		layerCanvas.height = this.canvas.height;
		const layerContext = layerCanvas.getContext("2d");

		if (!layerContext) {
			this.staticLayerCanvas = null;
			return null;
		}

		layerContext.save();
		layerContext.scale(dpr, dpr);
		this.drawStaticLayer(
			layerContext,
			width,
			height,
			pixelsPerSecond,
			laneHeight,
		);
		layerContext.restore();

		this.staticLayerCanvas = layerCanvas;
		return layerCanvas;
	}

	private drawStaticLayer(
		context: CanvasRenderingContext2D,
		width: number,
		height: number,
		pixelsPerSecond: number,
		laneHeight: number,
	): void {
		if (!this.track) return;

		context.fillStyle = "#0a0a0a";
		context.fillRect(0, 0, width, height);

		context.strokeStyle = "#333";
		context.lineWidth = 1;
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = Math.floor(i * laneHeight);
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(width, y);
			context.stroke();
		}

		for (const note of this.track.notes) {
			const x = note.startTime * pixelsPerSecond;
			const y = note.string * laneHeight;
			const noteWidth = Math.max(1, note.duration * pixelsPerSecond);

			context.fillStyle = STRING_COLORS[note.string] || "#fff";
			context.fillRect(x, y, noteWidth, laneHeight);
		}

		context.fillStyle = "#666";
		context.font = "10px sans-serif";
		context.textAlign = "right";
		context.fillText(
			this.formatDuration(this.songDuration),
			width - 2,
			height - 2,
		);
	}

	private drawPlayhead(
		width: number,
		height: number,
		currentTime: number,
		pixelsPerSecond: number,
	): void {
		const playheadX = Math.min(
			width,
			Math.max(0, currentTime * pixelsPerSecond),
		);
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(playheadX, 0);
		this.ctx.lineTo(playheadX, height);
		this.ctx.stroke();
	}

	private formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	getTimeFromX(x: number): number {
		if (!this.track || this.songDuration === 0) return 0;

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		if (width <= 0) return 0;
		const clampedX = Math.min(width, Math.max(0, x));

		return (clampedX / width) * this.songDuration;
	}
}
