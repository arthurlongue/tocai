import * as Tone from "tone";
import type { PlaybackNote, Track } from "../domain/types";
import {
	HIT_LINE_X,
	NOTE_CORNER_RADIUS,
	NOTE_HEIGHT,
	NOTE_TAIL_ALPHA,
	PIXELS_PER_SECOND,
	STRING_COLORS,
	STRING_COUNT,
} from "./constants";
import { calculateVisibleNotes, getNoteX, getNoteY } from "./layout";
import { getPlaybackTimelineTime } from "./playbackTimeline";

// Pre-parse note colors into RGB for tail alpha compositing
function hexToRgb(hex: string): string {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `${r},${g},${b}`;
}
const STRING_COLORS_RGB = STRING_COLORS.map(hexToRgb);

export class Renderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private track: Track | null = null;
	private frameId: number | null = null;
	private speed: number = 1.0;
	private maxNoteDuration: number = 0;

	// Optimization caches
	private bgGradient: CanvasGradient | null = null;
	private lastWidth: number = 0;
	private lastHeight: number = 0;

	// FPS Tracking
	private lastFrameTime: number = 0;
	private fps: number = 0;
	private frameCount: number = 0;
	private fpsLastUpdate: number = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) {
			throw new Error("Could not get 2D context from canvas");
		}
		this.ctx = ctx;
	}

	setTrack(track: Track): void {
		this.track = track;
		this.maxNoteDuration = track.notes.reduce(
			(maxDuration, note) => Math.max(maxDuration, note.duration),
			0,
		);
	}

	/**
	 * Set playback speed multiplier for visual synchronization
	 */
	setSpeed(speed: number): void {
		this.speed = speed;
	}

	/**
	 * Get current speed multiplier
	 */
	getSpeed(): number {
		return this.speed;
	}

	resetTime(_time: number = 0): void {
		// No-op: Tone.Transport.seconds is authoritative
	}

	initTime(): void {
		// No-op: Tone.Transport.seconds is authoritative
	}

	private loop = (timestamp: number): void => {
		this.updateFPS(timestamp);
		this.draw();
		if (this.frameId !== null) {
			this.frameId = window.requestAnimationFrame(this.loop);
		}
	};

	private updateFPS(timestamp: number): void {
		if (!this.lastFrameTime) {
			this.lastFrameTime = timestamp;
			this.fpsLastUpdate = timestamp;
			return;
		}

		this.frameCount++;
		if (timestamp - this.fpsLastUpdate >= 1000) {
			this.fps = Math.round(
				(this.frameCount * 1000) / (timestamp - this.fpsLastUpdate),
			);
			this.frameCount = 0;
			this.fpsLastUpdate = timestamp;
		}
		this.lastFrameTime = timestamp;
	}

	start(): void {
		if (this.frameId === null) {
			this.frameId = window.requestAnimationFrame(this.loop);
		}
	}

	stop(): void {
		if (this.frameId !== null) {
			window.cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
	}

	draw(): void {
		const context = Tone.getContext();
		const latency = (context.rawContext as AudioContext).outputLatency || 0;
		const lookAhead = context.lookAhead || 0;
		const delay = latency + lookAhead + 0.05;

		const rawTransportTime = Tone.getTransport().seconds;
		this.renderFrame(getPlaybackTimelineTime(rawTransportTime - delay));
	}

	drawAt(currentTime: number): void {
		this.renderFrame(currentTime);
	}

	private renderFrame(currentTime: number): void {
		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		const height = this.canvas.height / dpr;
		const laneHeight = height / STRING_COUNT;

		// Re-cache gradients if size changed
		if (width !== this.lastWidth || height !== this.lastHeight) {
			this.bgGradient = this.ctx.createLinearGradient(0, 0, 0, height);
			this.bgGradient.addColorStop(0, "#0d0d14");
			this.bgGradient.addColorStop(1, "#080810");
			this.lastWidth = width;
			this.lastHeight = height;
		}

		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// --- 1. Background ---
		if (this.bgGradient) {
			this.ctx.fillStyle = this.bgGradient;
			this.ctx.fillRect(0, 0, width, height);
		}

		// --- 2. String lines (drawn first so notes sit on top) ---
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = Math.floor(getNoteY(i, laneHeight));
			const color = STRING_COLORS[i] ?? "#888";

			this.ctx.save();
			this.ctx.shadowColor = color;
			this.ctx.shadowBlur = 4;
			this.ctx.strokeStyle = `rgba(${STRING_COLORS_RGB[i]},0.35)`;
			this.ctx.lineWidth = 1.5;
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(width, y);
			this.ctx.stroke();
			this.ctx.restore();
		}

		// --- 3. Hit line ---
		const hitLineX = Math.floor(HIT_LINE_X);
		this.ctx.strokeStyle = "rgba(255,255,255,0.9)";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(hitLineX, 0);
		this.ctx.lineTo(hitLineX, height);
		this.ctx.stroke();

		// Add subtle glow without expensive shadowBlur
		this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
		this.ctx.lineWidth = 6;
		this.ctx.stroke();

		// --- 4. Notes ---
		if (this.track && this.track.notes.length > 0) {
			const visibleNotes = calculateVisibleNotes(
				this.track.notes,
				currentTime,
				width,
				this.maxNoteDuration,
			);

			// Determine the actual string count from the track's tuning
			const actualStringCount = this.track.tuning.length;
			const stringCount = Math.min(actualStringCount, STRING_COUNT);

			// Optimization: Group notes by string in a single pass
			const notesByString: PlaybackNote[][] = Array.from(
				{ length: stringCount },
				() => [],
			);

			for (const n of visibleNotes) {
				// Safely handle notes with string indices within bounds
				if (n.string >= 0 && n.string < stringCount) {
					notesByString[n.string].push(n);
				}
			}

			// Render notes per string lane
			for (let s = 0; s < stringCount; s++) {
				if (notesByString[s].length > 0) {
					this.drawNotesInString(notesByString[s], s, currentTime, laneHeight);
				}
			}
		}

		// --- 5. FPS Counter (dev only) ---
		if (import.meta.env.DEV) {
			this.renderFPS(width);
		}
	}

	private renderFPS(width: number): void {
		this.ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
		this.ctx.font = "bold 12px monospace";
		this.ctx.textAlign = "right";
		this.ctx.textBaseline = "top";
		this.ctx.fillText(`${this.fps} FPS`, width - 10, 10);
	}

	private drawNotesInString(
		notes: PlaybackNote[],
		stringIndex: number,
		currentTime: number,
		laneHeight: number,
	): void {
		const color = STRING_COLORS[stringIndex] ?? "#fff";
		const colorRgb = STRING_COLORS_RGB[stringIndex] ?? "255,255,255";
		const tailH = NOTE_HEIGHT * 0.55;
		const tailHalfH = tailH / 2;

		// 1. Draw Tails
		for (const note of notes) {
			const x = getNoteX(note.startTime, currentTime);
			const y = getNoteY(note.string, laneHeight);

			// Adjust tail start distance based on the amount of digits to fix gaps
			const numDigits = note.fret.toString().length;
			const noteHalfW = numDigits === 1 ? 10 : 18;

			const tailWidth = Math.max(
				0,
				note.duration * PIXELS_PER_SECOND - noteHalfW,
			);

			if (tailWidth > 0) {
				const tailGrad = this.ctx.createLinearGradient(
					x + noteHalfW,
					y,
					x + noteHalfW + tailWidth,
					y,
				);
				tailGrad.addColorStop(0, `rgba(${colorRgb},${NOTE_TAIL_ALPHA})`);
				tailGrad.addColorStop(1, `rgba(${colorRgb},0)`);
				this.ctx.fillStyle = tailGrad;

				this.ctx.beginPath();
				this.ctx.roundRect(x + noteHalfW, y - tailHalfH, tailWidth, tailH, [
					0,
					NOTE_CORNER_RADIUS,
					NOTE_CORNER_RADIUS,
					0,
				]);
				this.ctx.fill();
			}
		}

		// 2. Draw Fret Numbers (Replaces Note Bodies)
		const fretFontSize = Math.round(NOTE_HEIGHT * 1.2);
		this.ctx.font = `900 ${fretFontSize}px 'Inter', system-ui, sans-serif`;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.lineWidth = 4;

		// Set shadow for some glow on the number
		this.ctx.shadowColor = color;
		this.ctx.shadowBlur = 6;

		for (const note of notes) {
			const x = getNoteX(note.startTime, currentTime);
			const y = getNoteY(note.string, laneHeight);
			const text = note.fret.toString();

			// Background stroke to hide the string line behind the number
			this.ctx.strokeStyle = "#0d0d14"; // Dark background
			this.ctx.strokeText(text, x, y);

			// The actual fret number
			this.ctx.fillStyle = color;
			this.ctx.fillText(text, x, y);
		}

		// Reset shadow
		this.ctx.shadowBlur = 0;
	}
}
