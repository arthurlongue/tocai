import type { PlaybackNote } from '../domain/types';

export function getNoteX(startTime: number, currentTime: number): number {
  return 0; // Stub
}

export function getNoteY(stringIndex: number, laneHeight: number): number {
  return 0; // Stub
}

export function calculateVisibleNotes(
  notes: PlaybackNote[],
  currentTime: number,
  viewportWidth: number
): PlaybackNote[] {
  return []; // Stub
}
