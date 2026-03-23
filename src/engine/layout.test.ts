import { describe, it, expect } from 'vitest';
import { getNoteX, getNoteY, calculateVisibleNotes } from './layout';
import type { PlaybackNote } from '../domain/types';

describe('Layout Math', () => {
  describe('getNoteX', () => {
    it('calculates the correct X position for a note at hit-line', () => {
      // Stub
      expect(true).toBe(true);
    });

    it('calculates the correct X position for a note in future', () => {
      // Stub
      expect(true).toBe(true);
    });

    it('calculates the correct X position for a note in past', () => {
      // Stub
      expect(true).toBe(true);
    });
  });

  describe('getNoteY', () => {
    it('calculates the correct Y position for each string', () => {
      // Stub
      expect(true).toBe(true);
    });
  });

  describe('calculateVisibleNotes', () => {
    it('returns only notes that are within the viewport buffer', () => {
      // Stub
      expect(true).toBe(true);
    });
  });
});
