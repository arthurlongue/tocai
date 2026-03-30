import * as Tone from "tone";
import type { HarmonyEvent, PlaybackNote, Track } from "../domain/types";
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

/** Pre-parse note colors into RGB for tail alpha compositing. */
function hexToRgb(hex: string): string {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `${r},${g},${b}`;
}
const STRING_COLORS_RGB = STRING_COLORS.map(hexToRgb);
const CHORD_LABEL_PADDING = 8;
const CHORD_LABEL_MIN_SPACING = 10;
const CHORD_LABEL_HORIZONTAL_BUFFER = 48;

/**
 * Canvas-based tablature renderer.
 *
 * Renders a scrolling guitar tablature view similar to Rocksmith or Synthesia,
 * with notes approaching a "hit line" from the right side of the screen.
 * The renderer uses `requestAnimationFrame` for smooth 60fps animation and
 * polls `Tone.Transport.seconds` directly for time (avoiding React state).
 *
 * Supports HiDPI displays by scaling the canvas using `window.devicePixelRatio`.
 */
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

	/**
	 * Creates a new Renderer instance.
	 * @param canvas - The HTML canvas element to render to
	 * @throws Error if the 2D context cannot be obtained
	 */
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) {
			throw new Error("Could not get 2D context from canvas");
		}
		this.ctx = ctx;
	}

	/**
	 * Sets the track to render.
	 * @param track - The track containing notes to display
	 */
	setTrack(track: Track): void {
		this.track = track;
		this.maxNoteDuration = track.notes.reduce(
			(maxDuration, note) => Math.max(maxDuration, note.duration),
			0,
		);
	}

	/**
	 * Sets the playback speed multiplier for visual synchronization.
	 * @param speed - Speed multiplier (e.g., 0.5 = half speed, 2 = double speed)
	 */
	setSpeed(speed: number): void {
		this.speed = speed;
	}

	/**
	 * Gets the current speed multiplier.
	 * @returns The current speed setting
	 */
	getSpeed(): number {
		return this.speed;
	}

	/**
	 * No-op for backwards compatibility.
	 * Tone.Transport.seconds is the authoritative time source.
	 */
	resetTime(_time: number = 0): void {
		// No-op: Tone.Transport.seconds is authoritative
	}

	/**
	 * No-op for backwards compatibility.
	 * Tone.Transport.seconds is the authoritative time source.
	 */
	initTime(): void {
		// No-op: Tone.Transport.seconds is authoritative
	}

	/** Animation loop callback bound to this instance. */
	private loop = (timestamp: number): void => {
		this.updateFPS(timestamp);
		this.draw();
		if (this.frameId !== null) {
			this.frameId = window.requestAnimationFrame(this.loop);
		}
	};

	/** Updates FPS tracking counters. */
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

	/**
	 * Starts the render loop.
	 * Call this when playback begins.
	 */
	start(): void {
		if (this.frameId === null) {
			this.frameId = window.requestAnimationFrame(this.loop);
		}
	}

	/**
	 * Stops the render loop.
	 * Call this when playback pauses or stops.
	 */
	stop(): void {
		if (this.frameId !== null) {
			window.cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
	}

	/**
	 * Draws a single frame using the current Tone.Transport time.
	 * Applies audio latency compensation for accurate visual sync.
	 */
	draw(): void {
		const context = Tone.getContext();
		const latency = (context.rawContext as AudioContext).outputLatency || 0;
		const lookAhead = context.lookAhead || 0;
		const delay = latency + lookAhead + 0.05;

		const rawTransportTime = Tone.getTransport().seconds;
		this.renderFrame(getPlaybackTimelineTime(rawTransportTime - delay));
	}

	/**
	 * Draws a single frame at a specific time.
	 * @param currentTime - The song time to render at (in seconds)
	 */
	drawAt(currentTime: number): void {
		this.renderFrame(currentTime);
	}

	/**
	 * Renders the complete frame for the given time.
	 */
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
		if (this.track) {
			if (this.track.notes.length > 0) {
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
						this.drawNotesInString(
							notesByString[s],
							s,
							currentTime,
							laneHeight,
						);
					}
				}
			}

			if ((this.track.harmonyEvents?.length ?? 0) > 0) {
				this.drawHarmonyLabels(
					this.track.harmonyEvents ?? [],
					currentTime,
					width,
					height,
					laneHeight,
				);
			}
		}

		// --- 5. FPS Counter (dev only) ---
		if (import.meta.env.DEV) {
			this.renderFPS(width);
		}
	}

	/** Renders the FPS counter in the top-right corner (dev mode only). */
	private renderFPS(width: number): void {
		this.ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
		this.ctx.font = "bold 12px monospace";
		this.ctx.textAlign = "right";
		this.ctx.textBaseline = "top";
		this.ctx.fillText(`${this.fps} FPS`, width - 10, 10);
	}

	private drawHarmonyLabels(
		harmonyEvents: HarmonyEvent[],
		currentTime: number,
		width: number,
		height: number,
		laneHeight: number,
	): void {
		this.ctx.save();
		this.ctx.font = "700 14px 'Inter', system-ui, sans-serif";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.lineWidth = 4;
		this.ctx.strokeStyle = "#0d0d14";
		this.ctx.fillStyle = "rgba(255,255,255,0.92)";
		this.ctx.shadowBlur = 0;

		let lastLabelRight = Number.NEGATIVE_INFINITY;

		for (const harmonyEvent of harmonyEvents) {
			if (harmonyEvent.confidence < 0.82) {
				continue;
			}

			const x = getNoteX(harmonyEvent.startTime, currentTime);
			if (
				x < -CHORD_LABEL_HORIZONTAL_BUFFER ||
				x > width + CHORD_LABEL_HORIZONTAL_BUFFER
			) {
				continue;
			}

			const halfLabelWidth =
				Math.max(24, harmonyEvent.label.length * 8 + CHORD_LABEL_PADDING * 2) /
				2;
			const labelLeft = x - halfLabelWidth;
			const labelRight = x + halfLabelWidth;

			if (labelLeft <= lastLabelRight + CHORD_LABEL_MIN_SPACING) {
				continue;
			}

			const y = Math.max(
				16,
				Math.min(
					height - 16,
					getNoteY(harmonyEvent.anchorString, laneHeight) - NOTE_HEIGHT * 1.4,
				),
			);

			this.ctx.strokeText(harmonyEvent.label, x, y);
			this.ctx.fillText(harmonyEvent.label, x, y);
			lastLabelRight = labelRight;
		}

		this.ctx.restore();
	}

	/**
	 * Renders all notes for a single string lane.
	 * Draws tails, fret numbers, and technique indicators.
	 */
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

		// 3. Draw Technique Indicators
		const indicatorFontSize = Math.round(NOTE_HEIGHT * 0.7);
		const indicatorOffsetY = -NOTE_HEIGHT * 0.9;

		this.ctx.font = `bold ${indicatorFontSize}px 'Inter', system-ui, sans-serif`;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 2;

		for (const note of notes) {
			const x = getNoteX(note.startTime, currentTime);
			const y = getNoteY(note.string, laneHeight);
			const tech = note.techniques;
			if (!tech) continue;

			if (tech.hammerOn) this.ctx.fillText("H", x, y + indicatorOffsetY);
			if (tech.pullOff) this.ctx.fillText("P", x, y + indicatorOffsetY);

			if (tech.bend) {
				this.ctx.fillText("⤴", x + NOTE_HEIGHT * 0.6, y + indicatorOffsetY);
			}

			if (tech.slide && tech.slide.type !== "none") {
				const slideLength = NOTE_HEIGHT * 0.8;
				const slideY =
					tech.slide.type === "up" ? y - slideLength : y + slideLength;
				this.ctx.beginPath();
				this.ctx.moveTo(x, y);
				this.ctx.lineTo(x, slideY);
				this.ctx.stroke();
			}

			if (tech.vibrato) {
				const waveAmplitude = 4;
				const waveSegments = 12;
				const waveLength = NOTE_HEIGHT * 2;
				const startX = x - waveLength / 2;
				const vibratoY = y + indicatorOffsetY + indicatorFontSize * 0.8;

				this.ctx.beginPath();
				this.ctx.moveTo(startX, vibratoY);
				for (let i = 1; i <= waveSegments; i++) {
					const wx = startX + (waveLength / waveSegments) * i;
					const wy = vibratoY + (i % 2 === 1 ? -waveAmplitude : waveAmplitude);
					this.ctx.lineTo(wx, wy);
				}
				this.ctx.stroke();
			}
		}
	}
}
