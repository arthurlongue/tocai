type VisualSyncListener = (songSeconds: number) => void;

const listeners = new Set<VisualSyncListener>();

export const syncVisualState = (songSeconds: number): void => {
	for (const listener of listeners) {
		listener(songSeconds);
	}
};

export const subscribeToVisualSync = (
	listener: VisualSyncListener,
): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
