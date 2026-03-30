/**
 * Callback type for visual sync listeners.
 * @param songSeconds - Current song time in seconds
 */
type VisualSyncListener = (songSeconds: number) => void;

/** Set of all registered visual sync listeners. */
const listeners = new Set<VisualSyncListener>();

/**
 * Broadcasts the current song time to all registered visual sync listeners.
 * Used to coordinate visual elements (like the playhead) with the current playback position.
 *
 * @param songSeconds - Current song time in seconds
 */
export const syncVisualState = (songSeconds: number): void => {
	for (const listener of listeners) {
		listener(songSeconds);
	}
};

/**
 * Subscribes a listener to visual sync updates.
 *
 * @param listener - Callback function to invoke on sync
 * @returns Unsubscribe function to remove the listener
 */
export const subscribeToVisualSync = (
	listener: VisualSyncListener,
): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
