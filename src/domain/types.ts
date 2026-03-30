/**
 * Represents a complete Guitar Pro song with all tracks and metadata.
 */
export interface Song {
	/** Song metadata including title, artist, and album information. */
	metadata: {
		title: string;
		artist: string;
		album: string;
	};
	/** All tracks in the song (e.g., guitar tracks, bass tracks). */
	tracks: Track[];
	/** Time measures that define the song's structure and timing. */
	measures: Measure[];
	/** Total duration of the song in seconds. */
	durationSeconds: number;
}

/**
 * A single track containing tablature notes for a specific instrument.
 * In Guitar Pro files, this typically represents one instrument's tablature.
 */
export interface Track {
	/** Unique identifier for this track. */
	id: string;
	/** Display name of the track (e.g., "Guitar", "Bass"). */
	name: string;
	/** MIDI note numbers for each string (low to high string order). */
	tuning: number[];
	/** Flattened array of all notes to be played in this track. */
	notes: PlaybackNote[];
}

/**
 * A measure (bar) representing a time segment in the song with its own time signature.
 * Measures are used to structure the song's rhythm and timing.
 */
export interface Measure {
	/** Zero-based index of this measure in the song. */
	index: number;
	/** Start time of this measure in seconds from the beginning of the song. */
	startTime: number;
	/** Duration of this measure in seconds. */
	duration: number;
	/** Time signature defining how many beats per measure. */
	timeSignature: {
		/** Number of beats per measure. */
		numerator: number;
		/** Note value that gets one beat (e.g., 4 = quarter note). */
		denominator: number;
	};
}

/**
 * A single note event to be played during playback.
 * This is the core data structure used by both the audio engine and renderer.
 */
export interface PlaybackNote {
	/** ID of the track this note belongs to. */
	trackId: string;
	/** MIDI note number (e.g., 60 = Middle C). */
	pitch: number;
	/** Start time of this note in seconds from the beginning of the song. */
	startTime: number;
	/** Duration of the note's sustain in seconds. */
	duration: number;
	/** 0-based string index where 0 is the lowest (thickest) string. */
	string: number;
	/** Fret number where this note is played. */
	fret: number;
	/** Special playing techniques applied to this note. */
	techniques: NoteTechniques;
}

/**
 * Represents special guitar playing techniques that modify how a note sounds.
 * All fields are optional and indicate whether that technique is applied.
 */
export interface NoteTechniques {
	/** Whether the note is played with palm muting (chugging). */
	isPalmMute?: boolean;
	/** Whether the note should ring until the next note on the same string. */
	isLetRing?: boolean;
	/** Whether the note should be played staccato (short and detached). */
	isStaccato?: boolean;
	/** Slide technique between notes. */
	slide?: {
		/** Direction of the slide: up, down, or none. */
		type: "up" | "down" | "none";
	};
	/** Bend technique for pitch manipulation. */
	bend?: {
		/** Type of bend effect. */
		type:
			| "normal"
			| "bendRelease"
			| "bendReleaseBend"
			| "prebend"
			| "prebendRelease";
		/** Bend intensity where 1.0 equals a full whole-step bend. */
		value: number;
	};
	/** Whether a vibrato effect is applied to the note. */
	vibrato?: boolean;
	/** Whether this note is the target of a hammer-on from a previous note. */
	hammerOn?: boolean;
	/** Whether this note is the target of a pull-off to a lower note. */
	pullOff?: boolean;
}
