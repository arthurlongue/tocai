export interface Song {
	metadata: {
		title: string;
		artist: string;
		album: string;
	};
	tracks: Track[];
	measures: Measure[];
	durationSeconds: number;
}

export interface Track {
	id: string;
	name: string;
	tuning: number[]; // MIDI notes for each string
	notes: PlaybackNote[];
}

export interface Measure {
	index: number;
	startTime: number; // Seconds from start
	duration: number; // Seconds
	timeSignature: {
		numerator: number;
		denominator: number;
	};
}

export interface PlaybackNote {
	trackId: string; // ID of the track this note belongs to
	pitch: number; // MIDI note number
	startTime: number; // Seconds from start
	duration: number; // Seconds
	string: number; // 0-based string index (0 is usually lowest/thickest string)
	fret: number;
	techniques: NoteTechniques;
}

export interface NoteTechniques {
	isPalmMute?: boolean;
	isLetRing?: boolean;
	isStaccato?: boolean;
	slide?: {
		type: "up" | "down" | "none";
	};
	bend?: {
		type:
			| "normal"
			| "bendRelease"
			| "bendReleaseBend"
			| "prebend"
			| "prebendRelease";
		value: number; // 1.0 is full bend
	};
	vibrato?: boolean;
	hammerOn?: boolean;
	pullOff?: boolean;
}
