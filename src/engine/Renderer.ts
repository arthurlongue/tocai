import * as Tone from "tone";
import type { PlaybackNote, Track } from "../domain/types";
import {
	HIT_LINE_X,
	NOTE_RADIUS,
	STRING_COLORS,
	STRING_COUNT,
} from "./constants";
import { calculateVisibleNotes, getNoteX, getNoteY } from "./layout";

export class Renderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private track: Track | null = null;
	private frameId: number | null = null;
	private speed: number = 1.0;
	private speedChangeTime: number = 0; // Transport time when speed last changed
	private positionAtSpeedChange: number = 0; // Song position when speed changed

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
	}

	/**
	 * Set playback speed multiplier for visual synchronization
	 * Called when user changes speed to keep canvas scroll in sync with audio
	 * @param speed - Speed multiplier (0.25 to 2.0)
	 */
	setSpeed(speed: number): void {
		const transportTime = Tone.getTransport().seconds;
		
		// Calculate current song position before speed change
		const currentPosition = this.positionAtSpeedChange + (transportTime - this.speedChangeTime) * this.speed;
		
		console.log("[Renderer.setSpeed] Setting speed from", this.speed, "to", speed);
		console.log("[Renderer.setSpeed] At transportTime:", transportTime.toFixed(2), "position:", currentPosition.toFixed(2));
		
		this.speed = speed;
		this.speedChangeTime = transportTime;
		this.positionAtSpeedChange = currentPosition;
		
		console.log("[Renderer.setSpeed] After assignment, this.speed =", this.speed);
	}

	/**
	 * Get current speed multiplier
	 */
	getSpeed(): number {
		return this.speed;
	}

	/**
	 * Reset song position to a specific time
	 * Call when seeking or stopping to resync with audio
	 * @param time - The time position to reset to (defaults to 0)
	 */
	resetTime(time: number = 0): void {
		this.speedChangeTime = Tone.getTransport().seconds;
		this.positionAtSpeedChange = time;
		console.log("[Renderer.resetTime] Reset to position:", time);
	}

	/**
	 * Initialize song position from current Transport position
	 * Call when starting playback to ensure sync
	 */
	initTime(): void {
		this.speedChangeTime = Tone.getTransport().seconds;
		this.positionAtSpeedChange = Tone.getTransport().seconds;
		console.log("[Renderer.initTime] Initialized position to:", this.positionAtSpeedChange);
	}

	private loop = (): void => {
		this.draw();
		if (this.frameId !== null) {
			this.frameId = window.requestAnimationFrame(this.loop);
		}
	};

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
		// Tone.js schedules events lookAhead seconds in the future
		const lookAhead = context.lookAhead || 0;
		// By subtracting this delay, we push the notes to the right,
		// causing them to hit the hit-line slightly later, perfectly
		// matching when the sound comes out of the speakers.
		// Added a small baseline constant (0.05) to tune it perfectly.
		const delay = latency + lookAhead + 0.05;

		// Get current transport time (wall-clock since transport started)
		const transportTime = Tone.getTransport().seconds;
		
		// Calculate current song position:
		// position = position_at_last_speed_change + (elapsed_transport_time * speed)
		// This ensures smooth speed transitions without jumps
		const songPosition = this.positionAtSpeedChange + (transportTime - this.speedChangeTime) * this.speed;
		
		// Apply delay compensation for audio latency
		// This pushes notes to the right so they hit the line when sound plays
		const currentTime = Math.max(0, songPosition - delay);
		
		// DEBUG: Log speed and time calculation
		// eslint-disable-next-line no-console
		if (window.location.hostname === "localhost") {
			// Only log every 30 frames to reduce noise
			const frameNum = Math.floor(transportTime * 60);
			if (frameNum % 30 === 0) {
				console.log(
					"[Renderer] speed:", this.speed.toFixed(2),
					"transportTime:", transportTime.toFixed(2),
					"songPosition:", songPosition.toFixed(2),
					"currentTime:", currentTime.toFixed(2)
				);
			}
		}

		const dpr = window.devicePixelRatio || 1;
		const width = this.canvas.width / dpr;
		const height = this.canvas.height / dpr;
		const laneHeight = height / STRING_COUNT;

		// Clear
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw string lanes (horizontal lines)
		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 1;
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = Math.floor(getNoteY(i, laneHeight));
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(width, y);
			this.ctx.stroke();
		}

		// Draw the Hit-Line (vertical playhead)
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		const hitLineX = Math.floor(HIT_LINE_X);
		this.ctx.beginPath();
		this.ctx.moveTo(hitLineX, 0);
		this.ctx.lineTo(hitLineX, height);
		this.ctx.stroke();

		// Culls and draws visible notes (circles with fret number text)
		if (this.track && this.track.notes.length > 0) {
			const visibleNotes = calculateVisibleNotes(
				this.track.notes,
				currentTime,
				width,
			);

			for (const note of visibleNotes) {
				this.drawNote(note, currentTime, laneHeight);
			}
		}
		
		// Draw string lanes OVER notes for better visibility
		this.ctx.strokeStyle = "#555";
		this.ctx.lineWidth = 1.5;
		for (let i = 0; i < STRING_COUNT; i++) {
			const y = Math.floor(getNoteY(i, laneHeight));
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(width, y);
			this.ctx.stroke();
		}
	}

	private drawNote(
		note: PlaybackNote,
		currentTime: number,
		laneHeight: number,
	): void {
		const x = getNoteX(note.startTime, currentTime);
		const y = getNoteY(note.string, laneHeight);
		const color = STRING_COLORS[note.string] || "#fff";

		// Circle
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(x, y, NOTE_RADIUS, 0, Math.PI * 2);
		this.ctx.fill();

		// Border
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.stroke();

		// Fret number
		this.ctx.fillStyle = "#000";
		this.ctx.font = "bold 12px sans-serif";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(note.fret.toString(), x, y);
	}
}
