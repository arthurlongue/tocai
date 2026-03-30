import type { Track } from "../domain/types";
import { STRING_COLORS, STRING_COUNT } from "./constants";

/** Pre-parse colors for alpha compositing. */
function hexToRgb(hex: string): string {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `${r},${g},${b}`;
}
const STRING_COLORS_RGB = STRING_COLORS.map(hexToRgb);

/**
 * A note in the minimap should look like a thin tick representing the attack,
 * not a fat block that spans the full sustain duration.
 * We cap the displayed width so the minimap shows density, not duration.
 */
const MINIMAP_NOTE_MAX_FRACTION = 0.12; // max fraction of laneHeight for note width

/**
 * Minimap renderer for song navigation.
 *
 * Renders a compact overview of the entire song showing all notes as colored ticks.
 * Uses a static layer for the background and notes, and only redraws the playhead
 * position during playback for better performance.
 */
export class MinimapRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private track: Track | null = null;
	private songDuration: number = 0;
	private staticLayerCanvas: HTMLCanvasElement | null = null;

	// FPS Tracking
	private lastFrameTime: number = 0;
	private fps: number = 0;
	private frameCount: number = 0;
	private fpsLastUpdate: number = 0;

	/**
	 * Creates a new MinimapRenderer.
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
	 * Sets the track to render in the minimap.
	 * @param track - The track containing notes to display
	 * @param songDuration - Optional explicit song duration; calculated from track if not provided
	 */
	setTrack(track: Track, songDuration?: number): void {
		this.track = track;
		this.songDuration = songDuration ?? this.calculateSongDuration(track);
		this.staticLayerCanvas = null;
		this.draw();
	}

	/** Calculates the total duration of the song from the track's notes. */
	private calculateSongDuration(track: Track): number {
		if (track.notes.length === 0) return 0;
		return track.notes.reduce(
			(max, note) => Math.max(max, note.startTime + note.duration),
			0,
		);
	}

	/** Updates FPS tracking counters. */
	private updateFPS(): void {
		const timestamp = performance.now();
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
	 * Draws the minimap at the current playback position.
	 * @param currentTime - Current song time in seconds (default: 0)
	 */
	draw(currentTime: number = 0): void {
		if (!this.track || this.songDuration === 0) return;

		this.updateFPS();

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

		// FPS Counter (dev only)
		if (import.meta.env.DEV) {
			this.ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
			this.ctx.font = "bold 9px monospace";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
			this.ctx.fillText(`${this.fps} FPS`, 3, 3);
		}

		this.ctx.restore();
	}

	/**
	 * Gets or creates a cached static layer canvas for the background.
	 * The static layer contains elements that don't change between frames.
	 */
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
		const layerContext = layerCanvas.getContext("2d", { alpha: false });

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

	/**
	 * Draws the static elements: background, string lanes, and note ticks.
	 */
	private drawStaticLayer(
		context: CanvasRenderingContext2D,
		width: number,
		height: number,
		pixelsPerSecond: number,
		laneHeight: number,
	): void {
		if (!this.track) return;

		// Background
		const bg = context.createLinearGradient(0, 0, 0, height);
		bg.addColorStop(0, "#0d0d14");
		bg.addColorStop(1, "#080810");
		context.fillStyle = bg;
		context.fillRect(0, 0, width, height);

		// Faint string lanes
		context.lineWidth = 0.5;
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = i * laneHeight + laneHeight / 2;
			context.strokeStyle = `rgba(${STRING_COLORS_RGB[i]},0.12)`;
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(width, y);
			context.stroke();
		}

		// Notes
		const maxNoteW = laneHeight * MINIMAP_NOTE_MAX_FRACTION;
		const noteDisplayH = laneHeight * 0.55;

		for (const note of this.track.notes) {
			const x = note.startTime * pixelsPerSecond;
			const y = note.string * laneHeight + (laneHeight - noteDisplayH) / 2;
			const noteW = Math.max(
				1.5,
				Math.min(maxNoteW, note.duration * pixelsPerSecond),
			);
			context.fillStyle = STRING_COLORS[note.string] ?? "#fff";
			context.globalAlpha = 0.85;
			context.fillRect(x, y, noteW, noteDisplayH);
		}
		context.globalAlpha = 1;

		// Duration label
		context.fillStyle = "rgba(255,255,255,0.4)";
		context.font = "9px system-ui, sans-serif";
		context.textAlign = "right";
		context.fillText(
			this.formatDuration(this.songDuration),
			width - 3,
			height - 3,
		);
	}

	/**
	 * Draws the playhead and the "played" overlay to the left of it.
	 */
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

		// Left-side "played" overlay
		if (playheadX > 0) {
			this.ctx.fillStyle = "rgba(255,255,255,0.06)";
			this.ctx.fillRect(0, 0, playheadX, height);
		}

		// Playhead line
		this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.moveTo(playheadX, 0);
		this.ctx.lineTo(playheadX, height);
		this.ctx.stroke();

		this.ctx.strokeStyle = "rgba(255,255,255,0.95)";
		this.ctx.lineWidth = 1.5;
		this.ctx.beginPath();
		this.ctx.moveTo(playheadX, 0);
		this.ctx.lineTo(playheadX, height);
		this.ctx.stroke();
	}

	/** Formats seconds into M:SS format. */
	private formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	/**
	 * Converts an X coordinate to song time.
	 * Used for click-to-seek functionality.
	 *
	 * @param x - The X coordinate in canvas space
	 * @returns The corresponding song time in seconds
	 */
	getTimeFromX(x: number): number {
		if (!this.track || this.songDuration === 0) return 0;

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		if (width <= 0) return 0;
		const clampedX = Math.min(width, Math.max(0, x));

		return (clampedX / width) * this.songDuration;
	}
}
