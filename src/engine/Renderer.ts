import type { Track } from '../domain/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private track: Track | null = null;
  private frameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  setTrack(track: Track): void {
    this.track = track;
  }

  start(): void {
    this.frameId = window.requestAnimationFrame(() => this.render());
  }

  stop(): void {
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  render(): void {
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render loop
    if (this.frameId !== null) {
      this.frameId = window.requestAnimationFrame(() => this.render());
    }
  }
}
