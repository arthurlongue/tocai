import type { Song } from '../domain/types';

/**
 * Parser service to process Guitar Pro files in a separate Web Worker.
 * Uses Transferable objects to avoid memory duplication.
 * 
 * @param file - The Guitar Pro file object from input or drop
 * @returns A promise that resolves to our internal Song format
 */
export async function parseFile(file: File): Promise<Song> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const fileName = file.name;

  return new Promise((resolve, reject) => {
    try {
      // Initialize the worker using Vite's worker pattern
      const worker = new Worker(new URL('./parser.worker.ts', import.meta.url), {
        type: 'module',
      });

      // Set up message handling
      worker.onmessage = (
        event: MessageEvent<{ type: 'success'; song: Song } | { type: 'error'; error: string }>
      ) => {
        const response = event.data;
        if (response.type === 'success') {
          resolve(response.song);
        } else {
          reject(new Error(response.error));
        }
        // Cleanup worker resources
        worker.terminate();
      };

      // Handle worker-level errors (e.g., script load failure)
      worker.onerror = (error) => {
        reject(new Error(`Worker failed: ${error.message}`));
        worker.terminate();
      };

      // Offload parsing to the worker
      // The second argument is the transfer list - zero-copy movement of memory
      worker.postMessage({ data, fileName }, [data.buffer]);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
