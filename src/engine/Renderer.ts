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
    private lastWidth: number = 0;
    private lastHeight: number = 0;

    // Static layer for background and string lines
    private staticCanvas: HTMLCanvasElement | null = null;
    private staticCtx: CanvasRenderingContext2D | null = null;

    // Reuse arrays to minimize GC pressure
    private notesByString: PlaybackNote[][] = Array.from(
        { length: STRING_COUNT },
        () => [],
    );

    // Cache fret number strings
    private fretStringCache: string[] = Array.from({ length: 32 }, (_, i) =>
        i.toString(),
    );

    // Cache tail gradients per string color
    private tailGradients: (CanvasGradient | null)[] = new Array(STRING_COUNT).fill(
        null,
    );

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
        // Invalidate static layer when track changes
        this.lastWidth = 0;
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

        // Re-cache static layer/gradients if size changed or track reset
        if (width !== this.lastWidth || height !== this.lastHeight) {
            this.updateStaticLayer(dpr, width, height);
            this.updateTailGradients(width);
            this.lastWidth = width;
            this.lastHeight = height;
        }

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // --- 1. Background & String Lines (Shared Static Layer) ---
        if (this.staticCanvas) {
            // Draw pre-rendered background and strings
            this.ctx.drawImage(this.staticCanvas, 0, 0, width, height);
        } else {
            // Fallback (should not happen if updateStaticLayer succeeds)
            this.ctx.fillStyle = "#0d0d14";
            this.ctx.fillRect(0, 0, width, height);
        }

        const laneHeight = height / STRING_COUNT;

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
            // Determine the actual string count from the track's tuning
            const actualStringCount = this.track.tuning.length;
            const stringCount = Math.min(actualStringCount, STRING_COUNT);

            // Optimization: Use pre-allocated notesByString to avoid allocations
            for (let i = 0; i < STRING_COUNT; i++) {
                this.notesByString[i].length = 0;
            }

            for (const n of visibleNotes) {
                if (n.string >= 0 && n.string < stringCount) {
                    this.notesByString[n.string].push(n);
                }
            }

            // Render notes per string lane
            for (let s = 0; s < stringCount; s++) {
                if (this.notesByString[s].length > 0) {
                    this.drawNotesInString(
                        this.notesByString[s],
                        s,
                        currentTime,
                        laneHeight,
                    );
                }
            }
        }

        // --- 5. FPS Counter (dev only) ---
        if ((import.meta as any).env?.DEV) {
            this.renderFPS(width);
        }
    }

    private updateStaticLayer(dpr: number, width: number, height: number): void {
        if (!this.staticCanvas) {
            this.staticCanvas = document.createElement("canvas");
        }
        this.staticCanvas.width = width * dpr;
        this.staticCanvas.height = height * dpr;
        this.staticCtx = this.staticCanvas.getContext("2d");
        if (!this.staticCtx) return;

        const ctx = this.staticCtx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 1. Background Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#0d0d14");
        gradient.addColorStop(1, "#080810");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. String Lines (with shadowBlur which is expensive, but here it's static)
        const laneHeight = height / STRING_COUNT;
        for (let i = 0; i < STRING_COUNT; i++) {
            const y = Math.floor(getNoteY(i, laneHeight));
            const color = STRING_COLORS[i] ?? "#888";

            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.strokeStyle = `rgba(${STRING_COLORS_RGB[i]},0.35)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.restore();
        }
    }

    private updateTailGradients(width: number): void {
        for (let i = 0; i < STRING_COUNT; i++) {
            const colorRgb = STRING_COLORS_RGB[i] ?? "255,255,255";
            // Pre-calculate a long-enough gradient for tails
            // MAX_TAIL_WIDTH covers most notes; longer ones will just repeat last color if we set canvas coords right
            const gradWidth = Math.max(width, 2000);
            const grad = this.ctx.createLinearGradient(0, 0, gradWidth, 0);
            grad.addColorStop(0, `rgba(${colorRgb},${NOTE_TAIL_ALPHA})`);
            grad.addColorStop(1, `rgba(${colorRgb},0)`);
            this.tailGradients[i] = grad;
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
        const tailH = NOTE_HEIGHT * 0.55;
        const tailHalfH = tailH / 2;

        // 1. Draw Tails
        const tailGrad = this.tailGradients[stringIndex];
        if (tailGrad) {
            this.ctx.fillStyle = tailGrad;
        }

        for (const note of notes) {
            const x = getNoteX(note.startTime, currentTime);
            const y = getNoteY(note.string, laneHeight);
            
            const numDigits = note.fret.toString().length;
            const noteHalfW = numDigits === 1 ? 10 : 18;
            const tailWidth = Math.max(0, note.duration * PIXELS_PER_SECOND - noteHalfW);

            if (tailWidth > 0) {
                this.ctx.save();
                // Shift the context so the cached gradient (starting at 0) matches the tail start
                this.ctx.translate(x + noteHalfW, 0);
                this.ctx.beginPath();
                this.ctx.roundRect(0, y - tailHalfH, tailWidth, tailH, [
                    0,
                    NOTE_CORNER_RADIUS,
                    NOTE_CORNER_RADIUS,
                    0,
                ]);
                this.ctx.fill();
                this.ctx.restore();
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
            const text = this.fretStringCache[note.fret] ?? note.fret.toString();

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