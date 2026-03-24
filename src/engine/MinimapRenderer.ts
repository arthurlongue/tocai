import type { Track } from "../domain/types";
import { STRING_COLORS, STRING_COUNT } from "./constants";

export class MinimapRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private track: Track | null = null;
	private songDuration: number = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Could not get 2D context from canvas");
		}
		this.ctx = ctx;
	}

	setTrack(track: Track): void {
		this.track = track;
		this.songDuration = this.calculateSongDuration(track);
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
		if (!this.track) return;

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		const height = this.canvas.height / dpr;

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw background
		this.ctx.fillStyle = "#0a0a0a";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Calculate scaling
		const pixelsPerSecond = width / this.songDuration;
		const laneHeight = height / STRING_COUNT;

		// Draw string lanes
		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 1;
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = Math.floor(i * laneHeight);
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(width, y);
			this.ctx.stroke();
		}

		// Draw compressed notes as rectangles
		for (const note of this.track.notes) {
			const x = note.startTime * pixelsPerSecond;
			const y = note.string * laneHeight;
			const noteWidth = Math.max(
				1,
				note.duration * pixelsPerSecond,
			);

			this.ctx.fillStyle = STRING_COLORS[note.string] || "#fff";
			this.ctx.fillRect(x, y, noteWidth, laneHeight);
		}

		// Draw current position playhead
		const playheadX = currentTime * pixelsPerSecond;
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(playheadX, 0);
		this.ctx.lineTo(playheadX, height);
		this.ctx.stroke();
	}

	getTimeFromX(x: number): number {
		if (!this.track || this.songDuration === 0) return 0;

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;

		return (x / width) * this.songDuration;
	}
}
