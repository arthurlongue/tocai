import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Renderer } from './Renderer';

// Mock Tone.js
vi.mock('tone', () => ({
  getTransport: () => ({
    seconds: 0,
  }),
}));

describe('Renderer', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // Basic canvas mock
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
  });

  it('instantiates the Renderer class', () => {
    const renderer = new Renderer(canvas);
    expect(renderer).toBeDefined();
  });

  it('can start and stop the render loop', () => {
    const renderer = new Renderer(canvas);
    const startSpy = vi.spyOn(window, 'requestAnimationFrame');
    const stopSpy = vi.spyOn(window, 'cancelAnimationFrame');

    renderer.start();
    expect(startSpy).toHaveBeenCalled();

    renderer.stop();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('can update the current track being rendered', () => {
    const renderer = new Renderer(canvas);
    const mockTrack = { id: '1', name: 'Test', tuning: [], notes: [] };
    renderer.setTrack(mockTrack);
    // expect renderer to have track
  });
});
