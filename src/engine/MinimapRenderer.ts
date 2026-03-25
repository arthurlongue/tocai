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

	setTrack(track: Track, songDuration?: number): void {
		this.track = track;
		this.songDuration = songDuration ?? this.calculateSongDuration(track);
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

		// Reset transform and clear
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Scale for HiDPI so we can use CSS pixels
		this.ctx.scale(dpr, dpr);

		// Draw background
		this.ctx.fillStyle = "#0a0a0a";
		this.ctx.fillRect(0, 0, width, height);

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
			const noteWidth = Math.max(1, note.duration * pixelsPerSecond);

			this.ctx.fillStyle = STRING_COLORS[note.string] || "#fff";
			this.ctx.fillRect(x, y, noteWidth, laneHeight);
		}

		// Draw current position playhead (clamped to canvas bounds)
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

		// Draw song duration marker at end
		this.ctx.fillStyle = "#666";
		this.ctx.font = "10px sans-serif";
		this.ctx.textAlign = "right";
		const durationText = this.formatDuration(this.songDuration);
		this.ctx.fillText(durationText, width - 2, height - 2);
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

		return (x / width) * this.songDuration;
	}
}
