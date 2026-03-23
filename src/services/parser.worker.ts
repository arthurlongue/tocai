import { parseTabFile } from 'guitarpro-parser';
import { flattenSong } from '../domain/flattening';

/**
 * Web Worker for parsing Guitar Pro files.
 * Offloads CPU-intensive parsing and domain flattening to a background thread.
 */
self.onmessage = (event: MessageEvent<{ data: Uint8Array; fileName: string }>) => {
  const { data, fileName } = event.data;

  try {
    // Parse the binary data into a TabSong
    const tabSong = parseTabFile(data, fileName);
    
    // Convert the rich TabSong format into our internal playback-optimized Song format
    const flattenedSong = flattenSong(tabSong);
    
    // Return the result to the main thread
    self.postMessage({ type: 'success', song: flattenedSong });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    self.postMessage({ type: 'error', error: errorMessage });
  }
};
